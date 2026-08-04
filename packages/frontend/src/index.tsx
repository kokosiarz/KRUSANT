import React from 'react';
import ReactDOM from 'react-dom/client';
// Self-hosted variable Inter — the theme has always asked for Inter, but
// nothing loaded it, so every screen silently fell back to Segoe UI. Bundled
// rather than pulled from a CDN so it also works offline and adds no
// third-party request.
import '@fontsource-variable/inter';
import './index.css';


import { BrowserRouter } from 'react-router-dom';
import App from './App';
import ErrorBoundary from './Components/Common/ErrorBoundary';
import { SettingsProvider } from './context/Settings';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <SettingsProvider>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </LocalizationProvider>
        </SettingsProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
