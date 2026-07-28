import { useMemo, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import './App.css';
import TopBar from './Components/TopBar';
import RequireRole from './Components/RequireRole';
import Login from './Pages/Login';
import Students from './Pages/Students';
import Groups from './Pages/Groups';
import Administration from './Pages/Administration';
import TemplatesSettings from './Pages/Settings/Pages/TemplatesSettings';
import UsersManagement from './Pages/UsersManagement';
import { createAppTheme } from './theme';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import Classes from './Pages/Classes';
import Dashboard from './Pages/Dashboard';
import Finances from './Pages/Finances';


type ColorMode = 'light' | 'dark';

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();
  const [mode, setMode] = useState<ColorMode>('dark');
  const theme = useMemo(() => createAppTheme(mode), [mode]);
  const toggleMode = () => setMode((prev) => (prev === 'light' ? 'dark' : 'light'));

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <CircularProgress />
        </Box>
      ) : !isAuthenticated ? (
        <Login />
      ) : (
        <Box className="App">
          <TopBar mode={mode} onToggleTheme={toggleMode} />
          <Box component="main" sx={{ flexGrow: 1, width: '100%' }}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route
                path="/students"
                element={
                  <RequireRole roles={['admin', 'teacher']}>
                    <Students />
                  </RequireRole>
                }
              />
              <Route
                path="/groups"
                element={
                  <RequireRole roles={['admin', 'teacher']}>
                    <Groups />
                  </RequireRole>
                }
              />
              <Route
                path="/classes"
                element={
                  <RequireRole roles={['admin', 'teacher']}>
                    <Classes />
                  </RequireRole>
                }
              />
              <Route
                path="/finances"
                element={
                  <RequireRole roles={['admin']}>
                    <Finances />
                  </RequireRole>
                }
              />
              <Route
                path="/templates"
                element={
                  <RequireRole roles={['admin']}>
                    <TemplatesSettings />
                  </RequireRole>
                }
              />
              <Route
                path="/users"
                element={
                  <RequireRole roles={['admin']}>
                    <UsersManagement />
                  </RequireRole>
                }
              />
              <Route
                path="/administration"
                element={
                  <RequireRole roles={['admin']}>
                    <Administration />
                  </RequireRole>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
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
