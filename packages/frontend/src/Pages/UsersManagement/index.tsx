import React, { useState, useEffect, useCallback } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LockResetIcon from '@mui/icons-material/LockReset';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { usersAdminApi, AdminUser, CreateUserRequest, UpdateUserRequest } from '../../api/endpoints/usersAdmin';

const AVAILABLE_ROLES = ['admin', 'teacher', 'student'];

const UsersManagement: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  // Form states
  const [formData, setFormData] = useState<{
    email: string;
    password: string;
    roles: string[];
  }>({
    email: '',
    password: '',
    roles: [],
  });
  const [newPassword, setNewPassword] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await usersAdminApi.getAllUsers();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nie udało się pobrać listy użytkowników');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const showSuccess = (message: string) => {
    setSuccess(message);
    setTimeout(() => setSuccess(null), 3000);
  };

  const handleOpenCreateDialog = () => {
    setFormData({ email: '', password: '', roles: [] });
    setCreateDialogOpen(true);
  };

  const handleOpenEditDialog = (user: AdminUser) => {
    setSelectedUser(user);
    setFormData({
      email: user.email,
      password: '',
      roles: user.roles || [],
    });
    setEditDialogOpen(true);
  };

  const handleOpenResetPasswordDialog = (user: AdminUser) => {
    setSelectedUser(user);
    setNewPassword('');
    setResetPasswordDialogOpen(true);
  };

  const handleOpenDeleteDialog = (user: AdminUser) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const handleCreateUser = async () => {
    try {
      setFormLoading(true);
      setError(null);
      const createData: CreateUserRequest = {
        email: formData.email,
        password: formData.password,
        roles: formData.roles,
      };
      await usersAdminApi.createUser(createData);
      setCreateDialogOpen(false);
      showSuccess('Użytkownik został utworzony');
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nie udało się utworzyć użytkownika');
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    try {
      setFormLoading(true);
      setError(null);
      const updateData: UpdateUserRequest = {
        email: formData.email,
        roles: formData.roles,
      };
      if (formData.password) {
        updateData.password = formData.password;
      }
      await usersAdminApi.updateUser(selectedUser.id, updateData);
      setEditDialogOpen(false);
      showSuccess('Użytkownik został zaktualizowany');
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nie udało się zaktualizować użytkownika');
    } finally {
      setFormLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!selectedUser) return;
    try {
      setFormLoading(true);
      setError(null);
      await usersAdminApi.resetPassword(selectedUser.id, { newPassword });
      setResetPasswordDialogOpen(false);
      showSuccess('Hasło zostało zresetowane');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nie udało się zresetować hasła');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    try {
      setFormLoading(true);
      setError(null);
      await usersAdminApi.deleteUser(selectedUser.id);
      setDeleteDialogOpen(false);
      showSuccess('Użytkownik został usunięty');
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nie udało się usunąć użytkownika');
    } finally {
      setFormLoading(false);
    }
  };

  const handleRoleToggle = (role: string) => {
    setFormData((prev) => ({
      ...prev,
      roles: prev.roles.includes(role)
        ? prev.roles.filter((r) => r !== role)
        : [...prev.roles, role],
    }));
  };

  const getRoleColor = (role: string): 'error' | 'primary' | 'success' | 'default' => {
    switch (role) {
      case 'admin':
        return 'error';
      case 'teacher':
        return 'primary';
      case 'student':
        return 'success';
      default:
        return 'default';
    }
  };

  const getRoleLabel = (role: string): string => {
    switch (role) {
      case 'admin':
        return 'Administrator';
      case 'teacher':
        return 'Nauczyciel';
      case 'student':
        return 'Kursant';
      default:
        return role;
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, width: '100%', maxWidth: 1200, margin: '0 auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Użytkownicy</Typography>
        <Button
          variant="contained"
          startIcon={<PersonAddIcon />}
          onClick={handleOpenCreateDialog}
        >
          Dodaj użytkownika
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Data utworzenia</TableCell>
              <TableCell align="right">Akcje</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.id}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1}>
                    {user.roles?.map((role) => (
                      <Chip
                        key={role}
                        label={getRoleLabel(role)}
                        color={getRoleColor(role)}
                        size="small"
                      />
                    ))}
                    {(!user.roles || user.roles.length === 0) && (
                      <Chip label="Brak ról" size="small" variant="outlined" />
                    )}
                  </Stack>
                </TableCell>
                <TableCell>
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString('pl-PL') : '-'}
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Edytuj">
                    <IconButton onClick={() => handleOpenEditDialog(user)} size="small">
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Resetuj hasło">
                    <IconButton onClick={() => handleOpenResetPasswordDialog(user)} size="small">
                      <LockResetIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Usuń">
                    <IconButton onClick={() => handleOpenDeleteDialog(user)} size="small" color="error">
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {users.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  Brak użytkowników
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create User Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Dodaj użytkownika</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
              disabled={formLoading}
            />
            <TextField
              fullWidth
              label="Hasło"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
              disabled={formLoading}
            />
            <FormControl component="fieldset">
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Role</Typography>
              <FormGroup row>
                {AVAILABLE_ROLES.map((role) => (
                  <FormControlLabel
                    key={role}
                    control={
                      <Checkbox
                        checked={formData.roles.includes(role)}
                        onChange={() => handleRoleToggle(role)}
                        disabled={formLoading}
                      />
                    }
                    label={getRoleLabel(role)}
                  />
                ))}
              </FormGroup>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)} disabled={formLoading}>
            Anuluj
          </Button>
          <Button
            onClick={handleCreateUser}
            variant="contained"
            disabled={formLoading || !formData.email || !formData.password}
          >
            {formLoading ? <CircularProgress size={20} /> : 'Utwórz'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edytuj użytkownika</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
              disabled={formLoading}
            />
            <TextField
              fullWidth
              label="Nowe hasło (opcjonalne)"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
              disabled={formLoading}
              helperText="Pozostaw puste, aby nie zmieniać hasła"
            />
            <FormControl component="fieldset">
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Role</Typography>
              <FormGroup row>
                {AVAILABLE_ROLES.map((role) => (
                  <FormControlLabel
                    key={role}
                    control={
                      <Checkbox
                        checked={formData.roles.includes(role)}
                        onChange={() => handleRoleToggle(role)}
                        disabled={formLoading}
                      />
                    }
                    label={getRoleLabel(role)}
                  />
                ))}
              </FormGroup>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)} disabled={formLoading}>
            Anuluj
          </Button>
          <Button
            onClick={handleUpdateUser}
            variant="contained"
            disabled={formLoading || !formData.email}
          >
            {formLoading ? <CircularProgress size={20} /> : 'Zapisz'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={resetPasswordDialogOpen} onClose={() => setResetPasswordDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Resetuj hasło</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            Resetowanie hasła dla użytkownika: <strong>{selectedUser?.email}</strong>
          </Typography>
          <TextField
            fullWidth
            label="Nowe hasło"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            disabled={formLoading}
            helperText="Minimum 6 znaków"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResetPasswordDialogOpen(false)} disabled={formLoading}>
            Anuluj
          </Button>
          <Button
            onClick={handleResetPassword}
            variant="contained"
            disabled={formLoading || newPassword.length < 6}
          >
            {formLoading ? <CircularProgress size={20} /> : 'Resetuj hasło'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Usuń użytkownika</DialogTitle>
        <DialogContent>
          <Typography>
            Czy na pewno chcesz usunąć użytkownika <strong>{selectedUser?.email}</strong>?
          </Typography>
          <Typography color="error" sx={{ mt: 1 }}>
            Ta operacja jest nieodwracalna.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={formLoading}>
            Anuluj
          </Button>
          <Button
            onClick={handleDeleteUser}
            variant="contained"
            color="error"
            disabled={formLoading}
          >
            {formLoading ? <CircularProgress size={20} /> : 'Usuń'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UsersManagement;
