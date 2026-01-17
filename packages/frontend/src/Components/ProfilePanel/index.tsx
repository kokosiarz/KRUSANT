import React, { useState } from 'react';
import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Collapse from '@mui/material/Collapse';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import LogoutIcon from '@mui/icons-material/Logout';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import SettingsIcon from '@mui/icons-material/Settings';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { ProfilePanelProps } from './types';
import { useAuth } from '../../hooks/useAuth';

const ProfilePanel: React.FC<ProfilePanelProps> = ({ open, onClose, mode, onToggleTheme, onPageChange }) => {
    const { user, logout } = useAuth();
    const [settingsOpen, setSettingsOpen] = useState(false);

    const userRoles = user?.roles?.map(role => role.toLowerCase()) ?? [];
    const isAdmin = userRoles.includes('admin');
    const isTeacher = userRoles.includes('teacher');
    const canManageCourses = isAdmin || isTeacher;
    const canManageGroups = isAdmin || isTeacher;

    const handleLogout = async () => {
        try {
            await logout();
            onClose();
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    const handleSettingsClick = (section: string) => {
        onPageChange(`Ustawienia:${section}`);
        setSettingsOpen(false);
        onClose();
    };

    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={onClose}
        >
            <Box
                role="presentation"
                sx={{
                    height: '100%', display: 'flex', flexDirection: 'column', width: { xs: '82%', sm: 340 },
                    backgroundColor: 'background.paper',
                }}
            >
                {/* User Profile Section */}
                <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Avatar
                        sx={{
                            width: 80,
                            height: 80,
                            margin: '0 auto 16px',
                            fontSize: '2rem',
                            bgcolor: 'primary.main',
                        }}
                    >
                        {user?.name?.charAt(0).toUpperCase() || '?'}
                    </Avatar>
                    <Typography variant="h6" fontWeight={700} gutterBottom>
                        {user?.name || 'Gość'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {user?.email || 'Brak adresu e-mail'}
                    </Typography>
                    <Stack direction="row" spacing={1} justifyContent="center" sx={{ mt: 1, flexWrap: 'wrap' }}>
                        {(user?.roles ?? []).length > 0 ? (
                            (user?.roles ?? []).map((role) => (
                                <Chip key={role} label={role} size="small" variant="outlined"/>
                            ))
                        ) : (
                            <Chip label="Brak roli" size="small" variant="outlined" />
                        )}
                    </Stack>
                </Box>

                <Divider />

                {/* Settings Section */}
                <List sx={{ flexGrow: 1 }}>
                    <ListItemButton
                        onClick={onToggleTheme}
                        sx={{ py: 2 }}
                    >
                        <ListItemIcon>
                            {mode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
                        </ListItemIcon>
                        <ListItemText
                            primary="Motyw"
                            secondary={mode === 'light' ? 'Przełącz na tryb ciemny' : 'Przełącz na tryb jasny'}
                        />
                    </ListItemButton>

                    <Divider />

                    {/* Ustawienia - Settings submenu */}
                    <ListItemButton
                        onClick={() => setSettingsOpen(!settingsOpen)}
                        sx={{ py: 2 }}
                    >
                        <ListItemIcon>
                            <SettingsIcon />
                        </ListItemIcon>
                        <ListItemText primary="Ustawienia" />
                        {settingsOpen ? <ExpandLess /> : <ExpandMore />}
                    </ListItemButton>
                    <Collapse in={settingsOpen} timeout="auto" unmountOnExit>
                        <List component="div" disablePadding>
                            <ListItemButton
                                sx={{ pl: 4, py: 1.5 }}
                                onClick={() => handleSettingsClick('Wygląd')}
                            >
                                <ListItemText primary="Wygląd" />
                            </ListItemButton>
                            {canManageCourses && (
                                <ListItemButton
                                    sx={{ pl: 4, py: 1.5 }}
                                    onClick={() => handleSettingsClick('Kursy')}
                                >
                                    <ListItemText primary="Kursy" />
                                </ListItemButton>
                            )}
                        </List>
                    </Collapse>

                    <Divider />

                    <ListItemButton
                        onClick={handleLogout}
                        sx={{ py: 2 }}
                    >
                        <ListItemIcon>
                            <LogoutIcon />
                        </ListItemIcon>
                        <ListItemText
                            primary="Wyloguj"
                            secondary="Wyloguj się ze swojego konta"
                        />
                    </ListItemButton>
                </List>
            </Box>
        </Drawer>
    );
};

export default ProfilePanel;
