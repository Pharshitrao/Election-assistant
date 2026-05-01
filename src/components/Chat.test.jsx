import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Chat from './Chat';
import { quickQuestions } from '../data/quickQuestions';

// Mock the Generative AI SDK
vi.mock('@google/generative-ai', () => {
  const mockSendMessage = vi.fn().mockResolvedValue({
    response: { text: () => 'Mocked AI response' }
  });
  const mockStartChat = vi.fn().mockReturnValue({
    sendMessage: mockSendMessage
  });
  const mockGetGenerativeModel = vi.fn().mockReturnValue({
    startChat: mockStartChat
  });
  
  return {
    GoogleGenerativeAI: class {
      constructor() {}
      getGenerativeModel() {
        return mockGetGenerativeModel();
      }
    }
  };
});

// Polyfill scrollIntoView since jsdom doesn't implement it
window.HTMLElement.prototype.scrollIntoView = vi.fn();

describe('Chat Component', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('sends a message when Enter key is pressed', async () => {
    render(<Chat setActiveStageId={vi.fn()} />);
    
    const input = screen.getByPlaceholderText(/Ask about the election.../i);
    
    fireEvent.change(input, { target: { value: 'How are elections held?' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter', charCode: 13 });
    
    // Check if the user message was added to the chat
    expect(screen.getByText('How are elections held?')).toBeInTheDocument();
    
    // Wait for the AI response to appear
    await waitFor(() => {
      expect(screen.getByText('Mocked AI response')).toBeInTheDocument();
    });
  });

  it('sends a message when a quick question button is clicked', async () => {
    render(<Chat setActiveStageId={vi.fn()} />);
    
    // Find the first quick question button
    const firstQuickQuestion = quickQuestions[0];
    const quickButton = screen.getByText(firstQuickQuestion);
    
    fireEvent.click(quickButton);
    
    // Check if the user message was added to the chat
    expect(screen.getAllByText(firstQuickQuestion).length).toBe(2);
    
    // Wait for the AI response to appear
    await waitFor(() => {
      expect(screen.getByText('Mocked AI response')).toBeInTheDocument();
    });
  });
});
