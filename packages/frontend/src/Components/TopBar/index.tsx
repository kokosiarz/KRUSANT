import React, { useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import MenuIcon from '@mui/icons-material/Menu';
import { TopBarProps } from './types';
import { useAuth } from '../../hooks/useAuth';
import Menu from '../../Menu';
import ProfilePanel from '../ProfilePanel';

const TopBar: React.FC<TopBarProps> = ({ mode, onToggleTheme }) => {
  const { user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleMenuOpen = () => setIsMenuOpen(true);
  const handleMenuClose = () => setIsMenuOpen(false);
  const handleProfileOpen = () => setIsProfileOpen(true);
  const handleProfileClose = () => setIsProfileOpen(false);

  return (
    <>
      <Menu open={isMenuOpen} onClose={handleMenuClose} onOpen={handleMenuOpen} />
      <ProfilePanel
        open={isProfileOpen}
        onClose={handleProfileClose}
        onOpen={handleProfileOpen}
        mode={mode}
        onToggleTheme={onToggleTheme}
      />

      {/* Colour/elevation come from the theme's MuiAppBar defaults: a surface
          with a hairline rule, rather than the solid gold slab this used to be. */}
      <AppBar position="sticky">
        <Toolbar sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton edge="start" color="inherit" aria-label="open menu" size="large" onClick={handleMenuOpen}>
            <MenuIcon />
          </IconButton>

          {/* The bar was empty between the menu button and the avatar, which
              made it look unfinished. The wordmark is also where the brand
              gold now lives, since the bar itself is no longer gold. */}
          <Typography
            variant="h6"
            component="span"
            sx={{
              fontWeight: 700,
              letterSpacing: '0.12em',
              color: 'primary.main',
              userSelect: 'none',
              ml: 0.5,
            }}
          >
            KRUSANT
          </Typography>

          <Box sx={{ flexGrow: 1 }} />

          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <Tooltip title="Profil">
              <IconButton onClick={handleProfileOpen} sx={{ p: 0.5 }}>
                <Avatar
                  sx={{
                    cursor: 'pointer',
                    bgcolor: user ? 'primary.main' : undefined,
                    color: user ? 'primary.contrastText' : undefined,
                  }}
                >
                  {(user?.name || user?.email)?.charAt(0).toUpperCase() || '?'}
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
