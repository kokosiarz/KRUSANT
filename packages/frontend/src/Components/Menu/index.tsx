import React from 'react';
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
import GroupIcon from '@mui/icons-material/Group';
import GroupsIcon from '@mui/icons-material/Groups';
import SettingsIcon from '@mui/icons-material/Settings';
import LayersIcon from '@mui/icons-material/Layers';
import PaidIcon from '@mui/icons-material/Paid';
import SchoolIcon from '@mui/icons-material/School';
import { useAuth } from '../../hooks/useAuth';

export type MenuProps = {
  open: boolean;
  onClose: () => void;
  onPageChange: (page: string) => void;
};

const Menu: React.FC<MenuProps> = ({ open, onClose, onPageChange }) => {
  const { user } = useAuth();
  const roles = user?.roles?.map((role: string) => role.toLowerCase()) ?? [];

  type MenuItem = { label: string; page: string; roles?: string[]; icon?: React.ReactNode };
  type MenuSection = { title: string; items: MenuItem[]; roles?: string[] };

  const sections: MenuSection[] = [
    {
      title: 'Ogólne',
      items: [
        { label: 'Dashboard', page: 'Dashboard', icon: <DashboardIcon /> },
      ],
    },
    {
      title: 'Dydaktyka',
      items: [
        { label: 'Zajęcia', page: 'Classes', roles: ['admin', 'teacher'], icon: <SchoolIcon /> },        
        { label: 'Kursanci', page: 'Kursanci', roles: ['admin', 'teacher'], icon: <PeopleIcon /> },
        { label: 'Grupy', page: 'Grupy', roles: ['admin', 'teacher'], icon: <GroupsIcon /> },
      ],
    },
    {
      title: 'Administracja',
      items: [
        { label: 'Szablony', page: 'Szablony', roles: ['admin', 'teacher'], icon: <LayersIcon /> },
        { label: 'Finanse', page: 'Finanse', roles: ['admin', 'teacher'], icon: <PaidIcon /> },
        { label: 'Administracja', page: 'Administracja', roles: ['admin'], icon: <SettingsIcon /> },
      ],
    },
    {
      title: 'Student',
      items: [
        // Placeholder for future student-specific items
      ],
      roles: ['student'],
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

  const handleMenuItemClick = (page: string) => {
    onPageChange(page);
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
          <Typography variant="h6" fontWeight={700}>
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
                .map((item) => (
                  <ListItemButton
                    key={item.label}
                    sx={{ py: 1.5, px: 2 }}
                    onClick={() => handleMenuItemClick(item.page)}
                  >
                    {item.icon && (
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        {item.icon}
                      </ListItemIcon>
                    )}
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{ fontWeight: 500 }}
                    />
                  </ListItemButton>
                ))}
              </Box>
            </React.Fragment>
          ))}
        </List>
      </Box>
    </Drawer>
  );
};

export default Menu;
