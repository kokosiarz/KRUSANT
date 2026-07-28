import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import GroupsIcon from '@mui/icons-material/Groups';
import SettingsIcon from '@mui/icons-material/Settings';
import LayersIcon from '@mui/icons-material/Layers';
import PaidIcon from '@mui/icons-material/Paid';
import SchoolIcon from '@mui/icons-material/School';
import { useAuth } from '@hooks/useAuth';

export type MenuProps = {
  open: boolean;
  onClose: () => void;
};

const Menu: React.FC<MenuProps> = ({ open, onClose }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const roles = user?.roles?.map((role: string) => role.toLowerCase()) ?? [];

  type MenuItem = { label: string; path: string; roles?: string[]; icon?: React.ReactNode };
  type MenuSection = { title: string; items: MenuItem[]; roles?: string[] };

  const sections: MenuSection[] = [
    {
      title: 'Ogólne',
      items: [
        { label: 'Dashboard', path: '/', icon: <DashboardIcon /> },
      ],
    },
    {
      title: 'Dydaktyka',
      items: [
        { label: 'Zajęcia', path: '/classes', roles: ['admin', 'teacher'], icon: <SchoolIcon /> },
        { label: 'Kursanci', path: '/students', roles: ['admin', 'teacher'], icon: <PeopleIcon /> },
        { label: 'Grupy', path: '/groups', roles: ['admin', 'teacher'], icon: <GroupsIcon /> },
      ],
    },
    {
      title: 'Administracja',
      items: [
        { label: 'Szablony', path: '/templates', roles: ['admin'], icon: <LayersIcon /> },
        { label: 'Finanse', path: '/finances', roles: ['admin'], icon: <PaidIcon /> },
        { label: 'Użytkownicy', path: '/users', roles: ['admin'], icon: <PeopleIcon /> },
        { label: 'Administracja', path: '/administration', roles: ['admin'], icon: <SettingsIcon /> },
      ],
    },
  ];

  const canViewItem = (itemRoles?: string[]) => {
    if (!itemRoles || itemRoles.length === 0) return true;
    return itemRoles.some((role) => roles.includes(role));
  };

  const shouldRenderSection = (section: MenuSection) => {
    if (section.roles && section.roles.length > 0 && !section.roles.some((role) => roles.includes(role))) {
      return false;
    }
    return section.items.some((item) => canViewItem(item.roles));
  };

  const handleMenuItemClick = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
    >
      <Box
        role="presentation"
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          width: { xs: '82%', sm: 340 },
          backgroundColor: 'background.paper',
        }}
      >
        <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Menu
          </Typography>
                  <IconButton onClick={onClose}>
                    <CloseIcon />
                  </IconButton>
        </Box>

        <Divider />

        <List sx={{ flexGrow: 1 }}>
          {sections.filter(shouldRenderSection).map((section, index) => (
            <React.Fragment key={section.title}>
              {index > 0 && <Divider sx={{ my: 1 }} />}
              <Box sx={{ mb: 1 }}>
                <Typography variant="overline" sx={{ px: 2, color: 'text.secondary', fontSize: '0.75rem' }}>
                {section.title}
              </Typography>
              {section.items
                .filter((item) => canViewItem(item.roles))
                .map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <ListItemButton
                      key={item.label}
                      selected={isActive}
                      sx={{ py: 1.5, px: 2 }}
                      onClick={() => handleMenuItemClick(item.path)}
                    >
                      {item.icon && (
                        <ListItemIcon sx={{ minWidth: 36, color: isActive ? 'primary.main' : undefined }}>
                          {item.icon}
                        </ListItemIcon>
                      )}
                      <ListItemText
                        primary={item.label}
                        slotProps={{ primary: { sx: { fontWeight: isActive ? 700 : 500, color: isActive ? 'primary.main' : undefined } } }}
                      />
                    </ListItemButton>
                  );
                })}
              </Box>
            </React.Fragment>
          ))}
        </List>
      </Box>
    </Drawer>
  );
};

export default Menu;
