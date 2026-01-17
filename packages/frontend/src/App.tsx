import React, { useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import './App.css';
import TopBar from './Components/TopBar';
import Login from './Components/Pages/Login';
import Students from './Components/Pages/Students';
import Groups from './Components/Pages/Groups';
import Administration from './Components/Pages/Administration';
import TemplatesSettings from './Components/Pages/Settings/Pages/TemplatesSettings';
import { createAppTheme } from './theme';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import Classes from './Components/Pages/Classes';
import Dashboard from './Components/Pages/Dashboard';
import Finances from './Components/Pages/Finances';


type ColorMode = 'light' | 'dark';

function AppContent() {
  const { isAuthenticated } = useAuth();
  const [mode, setMode] = useState<ColorMode>('dark');
  const [currentPage, setCurrentPage] = useState<string>('Dashboard');
  const theme = useMemo(() => createAppTheme(mode), [mode]);
  const toggleMode = () => setMode((prev) => (prev === 'light' ? 'dark' : 'light'));

  const handlePageChange = (page: string) => {
    setCurrentPage(page);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'Kursanci':
        return <Students />;
      case 'Grupy':
        return <Groups />;
      case 'Administracja':
        return <Administration />;
      case 'Szablony':
        return <TemplatesSettings />;
      case 'Classes':
        return <Classes />;
      case 'Finanse':
        return <Finances />;
      case 'Dashboard':
        return <Dashboard />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {!isAuthenticated ? (
        <Login />
      ) : (
        <Box className="App">
          <TopBar mode={mode} onToggleTheme={toggleMode} onPageChange={handlePageChange} />
          <Box component="main" sx={{ flexGrow: 1, width: '100%' }}>
            {renderPage()}
          </Box>
        </Box>
      )}
    </ThemeProvider>
  );
}

function App() {
  return (
      <AuthProvider>
        <AppContent />
      </AuthProvider>
  );
}

export default App;
