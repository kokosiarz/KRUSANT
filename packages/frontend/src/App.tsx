import { lazy, Suspense, useMemo, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import './App.css';
import TopBar from './Components/TopBar';
import RequireRole from './Components/RequireRole';
import Login from './Pages/Login';
import { createAppTheme } from './theme';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';

// Route-level code splitting: each page (and its dependencies — MUI X DataGrid,
// FullCalendar, etc.) only loads when the user actually navigates there.
const Dashboard = lazy(() => import('./Pages/Dashboard'));
const Students = lazy(() => import('./Pages/Students'));
const Groups = lazy(() => import('./Pages/Groups'));
const Classes = lazy(() => import('./Pages/Classes'));
const Finances = lazy(() => import('./Pages/Finances'));
const TemplatesSettings = lazy(() => import('./Pages/Settings/Pages/TemplatesSettings'));
const UsersManagement = lazy(() => import('./Pages/UsersManagement'));
const Administration = lazy(() => import('./Pages/Administration'));
const Teachers = lazy(() => import('./Pages/Teachers'));
const Rooms = lazy(() => import('./Pages/Rooms'));
const Courses = lazy(() => import('./Pages/Courses'));

type ColorMode = 'light' | 'dark';

const RouteFallback = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
    <CircularProgress />
  </Box>
);

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
            <Suspense fallback={<RouteFallback />}>
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
                  path="/teachers"
                  element={
                    <RequireRole roles={['admin']}>
                      <Teachers />
                    </RequireRole>
                  }
                />
                <Route
                  path="/rooms"
                  element={
                    <RequireRole roles={['admin']}>
                      <Rooms />
                    </RequireRole>
                  }
                />
                <Route
                  path="/courses"
                  element={
                    <RequireRole roles={['admin']}>
                      <Courses />
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
            </Suspense>
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
