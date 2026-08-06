import React from 'react';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import PasskeySection from './PasskeySection';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import CloseIcon from '@mui/icons-material/Close';
import LogoutIcon from '@mui/icons-material/Logout';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import InstallMobileIcon from '@mui/icons-material/InstallMobile';
import { ProfilePanelProps } from './types';
import { useAuth } from '../../hooks/useAuth';
import { useCloseOnBackButton } from '../../hooks/useCloseOnBackButton';
import { usePwaInstall } from '../../hooks/usePwaInstall';
import IosInstallDialog from '../PwaPrompts/IosInstallDialog';

const ProfilePanel: React.FC<ProfilePanelProps> = ({ open, onClose, onOpen, mode, onToggleTheme }) => {
    const { user, logout } = useAuth();
    useCloseOnBackButton(open, onClose);

    // The install banner appears once and can be dismissed for 30 days. This is
    // where someone who said "not now" comes back to it — the browser's install
    // event is held in pwa.ts regardless of the banner, so it still works.
    const { canInstall, installable, ios, promptInstall } = usePwaInstall();
    const [showIosHelp, setShowIosHelp] = React.useState(false);

    const handleInstall = async () => {
        if (canInstall) {
            await promptInstall();
            return;
        }
        setShowIosHelp(true);
    };

    const handleLogout = async () => {
        try {
            await logout();
            onClose();
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <SwipeableDrawer
            anchor="right"
            open={open}
            onClose={onClose}
            onOpen={onOpen ?? (() => {})}
            disableSwipeToOpen
            ModalProps={{ keepMounted: true }}
            // The width belongs on the paper, not on the content inside it.
            // With it on the child, the paper stayed shrink-to-fit and ended up
            // wider than its own contents, leaving a dead strip down the right
            // that dividers never reached and text wrapped short of.
            slotProps={{ paper: { sx: { width: { xs: '88%', sm: 360 }, maxWidth: 420 } } }}
        >
            <Box
                role="presentation"
                sx={{
                    height: '100%', display: 'flex', flexDirection: 'column', width: '100%',
                    backgroundColor: 'background.paper',
                }}
            >
                {/* px matches PasskeySection and the list items below, so every
                    section shares the same gutter on both sides. */}
                <Box sx={{ px: 2, pt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        Profil
                    </Typography>
                    <IconButton onClick={onClose} aria-label="Zamknij panel profilu">
                        <CloseIcon />
                    </IconButton>
                </Box>

                {/* User Profile Section */}
                <Box sx={{ px: 2, pt: 2, pb: 3, textAlign: 'center' }}>
                    <Avatar
                        sx={{
                            width: 80,
                            height: 80,
                            margin: '0 auto 16px',
                            fontSize: '2rem',
                            bgcolor: 'primary.main',
                        }}
                    >
                        {(user?.name || user?.email)?.charAt(0).toUpperCase() || '?'}
                    </Avatar>
                    <Typography variant="h6" sx={{ fontWeight: 700 }} gutterBottom>
                        {user?.name || user?.email || 'Gość'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {user?.email || 'Brak adresu e-mail'}
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ justifyContent: 'center', mt: 1, flexWrap: 'wrap' }}>
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

                <PasskeySection />

                <Divider />

                {/* Settings Section */}
                <List sx={{ flexGrow: 1 }}>
                    {/* Hidden once the app is installed, and on browsers that
                        can't install at all — an entry that did nothing would
                        be worse than none. */}
                    {installable && (
                        <>
                            <ListItemButton onClick={handleInstall} sx={{ py: 2 }}>
                                <ListItemIcon>
                                    <InstallMobileIcon />
                                </ListItemIcon>
                                <ListItemText
                                    primary="Zainstaluj aplikację"
                                    secondary={
                                        canInstall
                                            ? 'Dodaj do ekranu głównego — bez paska przeglądarki'
                                            : 'Zobacz, jak dodać do ekranu początkowego'
                                    }
                                />
                            </ListItemButton>
                            <Divider />
                        </>
                    )}

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

            {ios && <IosInstallDialog open={showIosHelp} onClose={() => setShowIosHelp(false)} />}
        </SwipeableDrawer>
    );
};

export default ProfilePanel;
