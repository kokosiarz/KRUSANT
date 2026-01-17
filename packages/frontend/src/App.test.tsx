import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders welcome heading', () => {
  render(<App />);
  const heading = screen.getByRole('heading', { name: /welcome to krusant/i });
  expect(heading).toBeInTheDocument();
});
