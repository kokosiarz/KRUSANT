import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';

test('renders the login form when not authenticated', async () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>,
  );

  // The card heading is just "Zaloguj się" — the KRUSANT wordmark sits above
  // the card as branding rather than being repeated in the heading.
  const heading = await screen.findByRole('heading', { name: /^zaloguj się$/i });
  expect(heading).toBeInTheDocument();
});
