import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Chat from './Chat';
import { quickQuestions } from '../data/quickQuestions';

// Mock react-ga4
vi.mock('react-ga4', () => ({
  default: {
    event: vi.fn(),
  }
}));

// Polyfill scrollIntoView
window.HTMLElement.prototype.scrollIntoView = vi.fn();

describe('Chat Component', () => {
  let fetchMock;

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    
    // Mock global fetch
    fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ text: 'Mocked API response' }),
    });
    global.fetch = fetchMock;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('sends a message when Send button is clicked', async () => {
    render(<Chat setActiveStageId={vi.fn()} />);
    
    const input = screen.getByPlaceholderText(/Ask about the election.../i);
    const sendButton = screen.getByRole('button', { name: /Send message/i });
    
    fireEvent.change(input, { target: { value: 'How does it work?' } });
    fireEvent.click(sendButton);
    
    expect(screen.getByText('How does it work?')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText('Mocked API response')).toBeInTheDocument();
    });
  });

  it('sends a message when Enter key is pressed', async () => {
    render(<Chat setActiveStageId={vi.fn()} />);
    
    const input = screen.getByPlaceholderText(/Ask about the election.../i);
    
    fireEvent.change(input, { target: { value: 'How are elections held?' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter', charCode: 13 });
    
    expect(screen.getByText('How are elections held?')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText('Mocked API response')).toBeInTheDocument();
    });
  });

  it('does not send an empty message', () => {
    render(<Chat setActiveStageId={vi.fn()} />);
    
    const input = screen.getByPlaceholderText(/Ask about the election.../i);
    const sendButton = screen.getByRole('button', { name: /Send message/i });
    
    fireEvent.change(input, { target: { value: '   ' } });
    fireEvent.click(sendButton);
    
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('displays a loading indicator while waiting for response', async () => {
    // Delay the fetch response to ensure loading is visible
    global.fetch = vi.fn().mockImplementation(() => new Promise(resolve => {
      setTimeout(() => resolve({ ok: true, json: async () => ({ text: 'Response' }) }), 100);
    }));

    render(<Chat setActiveStageId={vi.fn()} />);
    
    const input = screen.getByPlaceholderText(/Ask about the election.../i);
    fireEvent.change(input, { target: { value: 'Test loading' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    
    // Skeleton loaders use class 'skeleton'
    expect(screen.getAllByRole('generic').some(el => el.className.includes('skeleton'))).toBe(true);

    await waitFor(() => {
      expect(screen.getByText('Response')).toBeInTheDocument();
    });
  });

  it('shows an error message on API failure', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Server Error 500' }),
    });

    render(<Chat setActiveStageId={vi.fn()} />);
    
    const input = screen.getByPlaceholderText(/Ask about the election.../i);
    fireEvent.change(input, { target: { value: 'Trigger error' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    
    await waitFor(() => {
      expect(screen.getByText(/Server Error 500/i)).toBeInTheDocument();
    });
  });

  it('saves and loads chat history from localStorage', async () => {
    const history = [
      { role: 'assistant', content: 'Greeting' },
      { role: 'user', content: 'My question' },
      { role: 'assistant', content: 'My answer' }
    ];
    localStorage.setItem('electionChatHistory', JSON.stringify(history));

    render(<Chat setActiveStageId={vi.fn()} />);
    
    expect(screen.getByText('My question')).toBeInTheDocument();
    expect(screen.getByText('My answer')).toBeInTheDocument();
  });
});
