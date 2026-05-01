import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Header from './Header';

vi.mock('../context/ThemeContext', () => ({
  useTheme: () => ({
    isDark: true,
    toggleTheme: vi.fn(),
  }),
}));

describe('Header Component', () => {
  it('renders correctly with explored count and total stages', () => {
    render(
      <MemoryRouter>
        <Header exploredCount={3} totalStages={10} />
      </MemoryRouter>
    );
    
    expect(screen.getByText('Indian Election Assistant')).toBeInTheDocument();
    expect(screen.getByText('Explore 3 of 10 stages')).toBeInTheDocument();
  });
});
