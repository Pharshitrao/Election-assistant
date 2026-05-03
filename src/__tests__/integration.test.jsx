import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from '../App';

// Mock react-ga4 to prevent errors during tests
vi.mock('react-ga4', () => ({
  default: {
    event: vi.fn(),
    initialize: vi.fn(),
    send: vi.fn(),
  }
}));

// Polyfill scrollIntoView since jsdom doesn't implement it
window.HTMLElement.prototype.scrollIntoView = vi.fn();

// Mock fetch for the Chat API
const mockFetch = vi.fn().mockResolvedValue({
  ok: true,
  json: async () => ({ text: 'Mocked API response' }),
});
global.fetch = mockFetch;

describe('Integration Tests: User Journeys', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('Full user journey: Explore timeline and interact with chat', async () => {
    render(<App />);

    // 1. Verify landing page renders
    expect(screen.getByText('Indian Election Assistant')).toBeInTheDocument();
    expect(screen.getByText('The Election Timeline')).toBeInTheDocument();

    // 2. Click a timeline stage (e.g., Stage 1)
    const stage1Button = screen.getByRole('button', { name: /Stage 1:/i });
    fireEvent.click(stage1Button);

    // 3. Verify detail panel opens (should find description)
    expect(screen.getAllByText(/The Election Commission of India/i).length).toBeGreaterThan(0);

    // 4. Scroll down to Chat component
    const chatInput = screen.getByPlaceholderText(/Ask about the election.../i);
    expect(chatInput).toBeInTheDocument();

    // 5. Send a chat message
    fireEvent.change(chatInput, { target: { value: 'Tell me more about EVMs' } });
    
    const sendButton = screen.getByRole('button', { name: /Send message/i });
    fireEvent.click(sendButton);

    // 6. Verify message appears in chat
    expect(screen.getByText('Tell me more about EVMs')).toBeInTheDocument();

    // 7. Wait for AI response
    await waitFor(() => {
      expect(screen.getByText('Mocked API response')).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('Full user journey: Quiz completion flow', async () => {
    render(<App />);

    // 1. Find and start the quiz
    const startButton = screen.getByRole('button', { name: /Start Quiz/i });
    fireEvent.click(startButton);

    // 2. Wait for the AI loading time
    await waitFor(() => {
      expect(screen.getByText(/Question 1 of 5/i)).toBeInTheDocument();
    }, { timeout: 3000 });

    // 3. Answer all 5 questions
    for (let i = 0; i < 5; i++) {
      // Find the quiz section first to avoid grabbing other buttons
      const quizHeading = screen.getByText(new RegExp(`Question ${i + 1} of 5`, 'i'));
      const quizContainer = quizHeading.closest('div').parentElement;
      const options = within(quizContainer).getAllByRole('button');
      
      // Click the first option
      fireEvent.click(options[0]);
      
      if (i < 4) {
        await waitFor(() => {
          expect(screen.getByText(new RegExp(`Question ${i + 2} of 5`, 'i'))).toBeInTheDocument();
        }, { timeout: 3000 });
      }
    }

    // 4. Wait for the quiz to finish and show results
    await waitFor(() => {
      expect(screen.getByText(/Quiz Complete!/i)).toBeInTheDocument();
    }, { timeout: 3000 });
    expect(screen.getByText(/You scored/i)).toBeInTheDocument();

    // 5. Click "Try Again"
    const tryAgainButton = screen.getByRole('button', { name: /Try Again/i });
    fireEvent.click(tryAgainButton);

    await waitFor(() => {
      expect(screen.getByText(/Question 1 of 5/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  }, 20000); // 20s timeout for this long test
});
