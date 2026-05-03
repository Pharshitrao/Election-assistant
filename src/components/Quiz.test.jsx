import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Quiz from './Quiz';

// Mock react-ga4
vi.mock('react-ga4', () => ({
  default: {
    event: vi.fn(),
  }
}));

// Mock the questions data
vi.mock('../data/quizQuestions', () => ({
  quizQuestions: [
    {
      question: "Test Question 1",
      options: ["Option A", "Option B", "Option C", "Option D"],
      correctIndex: 1, // Option B
      explanation: "Test Explanation 1"
    },
    {
      question: "Test Question 2",
      options: ["Option A", "Option B", "Option C", "Option D"],
      correctIndex: 0,
      explanation: "Test Explanation 2"
    },
    {
      question: "Test Question 3",
      options: ["Option A", "Option B", "Option C", "Option D"],
      correctIndex: 0,
      explanation: "Test Explanation 3"
    },
    {
      question: "Test Question 4",
      options: ["Option A", "Option B", "Option C", "Option D"],
      correctIndex: 0,
      explanation: "Test Explanation 4"
    },
    {
      question: "Test Question 5",
      options: ["Option A", "Option B", "Option C", "Option D"],
      correctIndex: 0,
      explanation: "Test Explanation 5"
    }
  ]
}));

describe('Quiz Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock Math.random so the shuffle is predictable (always reverse or keep order)
    vi.spyOn(Math, 'random').mockReturnValue(0);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('loads with 5 questions', async () => {
    render(<Quiz />);
    
    const startButton = screen.getByRole('button', { name: /Start Quiz/i });
    fireEvent.click(startButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Question 1 of 5/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('highlights selected answer and calculates score', async () => {
    render(<Quiz />);
    
    fireEvent.click(screen.getByRole('button', { name: /Start Quiz/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/Question 1 of 5/i)).toBeInTheDocument();
    }, { timeout: 3000 });

    const options = screen.getAllByRole('button');
    // With Math.random() = 0, sort(() => 0.5) keeps the original order.
    // The first question's correct index is 1 (Option B)
    const correctAnswer = options[1];
    
    fireEvent.click(correctAnswer);
    
    expect(screen.getByText('Score: 1')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText(/Question 2 of 5/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('resets the quiz when Try Again is clicked', async () => {
    render(<Quiz />);
    
    fireEvent.click(screen.getByRole('button', { name: /Start Quiz/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/Question 1 of 5/i)).toBeInTheDocument();
    }, { timeout: 3000 });

    // Click through all 5 questions
    for (let i = 0; i < 5; i++) {
      const options = screen.getAllByRole('button');
      fireEvent.click(options[0]);
      
      if (i < 4) {
        await waitFor(() => {
          expect(screen.getByText(new RegExp(`Question ${i + 2} of 5`, 'i'))).toBeInTheDocument();
        }, { timeout: 3000 });
      }
    }

    await waitFor(() => {
      expect(screen.getByText(/Quiz Complete!/i)).toBeInTheDocument();
    }, { timeout: 3000 });

    const tryAgainButton = screen.getByRole('button', { name: /Try Again/i });
    fireEvent.click(tryAgainButton);

    await waitFor(() => {
      expect(screen.getByText(/Question 1 of 5/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  }, 20000); // 20s timeout for this long test
});
