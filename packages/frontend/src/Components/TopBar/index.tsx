import React, { useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
// import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import MenuIcon from '@mui/icons-material/Menu';
import { TopBarProps } from './types';
import { useAuth } from '../../hooks/useAuth';
import Menu from '../../Menu';
import ProfilePanel from '../ProfilePanel';

const TopBar: React.FC<TopBarProps> = ({ mode, onToggleTheme, onPageChange }) => {
  const { user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleMenuOpen = () => setIsMenuOpen(true);
  const handleMenuClose = () => setIsMenuOpen(false);
  const handleProfileOpen = () => setIsProfileOpen(true);
  const handleProfileClose = () => setIsProfileOpen(false);

  return (
    <>
      <Menu open={isMenuOpen} onClose={handleMenuClose} onPageChange={onPageChange} />
      <ProfilePanel 
        open={isProfileOpen} 
        onClose={handleProfileClose} 
        mode={mode}
        onToggleTheme={onToggleTheme}
        onPageChange={onPageChange}
      />

      <AppBar position="static" elevation={0} color="primary">
        <Toolbar sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton edge="start" color="inherit" aria-label="open menu" size="large" onClick={handleMenuOpen}>
            <MenuIcon />
          </IconButton>

          <Box sx={{ flexGrow: 1 }} />

          <Stack direction="row" spacing={1.5} alignItems="center">
            <Tooltip title="Profil">
              <IconButton onClick={handleProfileOpen} sx={{ p: 0.5 }}>
                <Avatar
                  sx={{
                    cursor: 'pointer',
                    bgcolor: user ? 'primary.main' : undefined,
                    color: user ? 'primary.contrastText' : undefined,
                  }}
                >
                  {user?.name?.charAt(0).toUpperCase() || '?'}
                </Avatar>
              </IconButton>
            </Tooltip>
          </Stack>
        </Toolbar>
      </AppBar>
    </>
  );
};

export default TopBar;
