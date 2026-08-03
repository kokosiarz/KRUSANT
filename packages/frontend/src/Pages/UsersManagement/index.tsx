import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LockResetIcon from '@mui/icons-material/LockReset';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import {
  usersAdminApi,
  AdminUser,
  CreateUserRequest,
  UpdateUserRequest,
  IssuedCredentials,
} from '@/api/endpoints/usersAdmin';
import { getRoleColor, getRoleLabel } from './roleLabels';
import UserFormDialog, { UserFormValues } from './UserFormDialog';
import ResetPasswordDialog from './ResetPasswordDialog';
import TempPasswordDialog from './TempPasswordDialog';
import DeleteUserDialog from './DeleteUserDialog';

type DialogKind = 'create' | 'edit' | 'reset' | 'delete' | null;

const errorMessage = (err: unknown, fallback: string) => (err instanceof Error ? err.message : fallback);

const UsersManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const [openDialog, setOpenDialog] = useState<DialogKind>(null);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  // Set only when an email failed and the admin has to read the password off
  // the screen instead.
  const [issued, setIssued] = useState<IssuedCredentials | null>(null);

  const { data: users = [], isLoading } = useQuery<AdminUser[]>({
    queryKey: ['users'],
    queryFn: usersAdminApi.getAllUsers,
  });

  const closeDialog = () => setOpenDialog(null);
  const showSuccess = (message: string) => {
    setSuccess(message);
    setTimeout(() => setSuccess(null), 3000);
  };
  const invalidateUsers = () => queryClient.invalidateQueries({ queryKey: ['users'] });

  /**
   * Creating a user and resetting a password both come back the same way: the
   * password was emailed, or it wasn't and the plaintext is in the response for
   * the admin to pass on by hand.
   */
  const handleIssued = (result: IssuedCredentials, sentMessage: string) => {
    if (result.emailSent) {
      showSuccess(`${sentMessage}. Hasło tymczasowe wysłano na ${result.user.email}.`);
    } else {
      setIssued(result);
    }
  };

  const createMutation = useMutation({
    mutationFn: (data: CreateUserRequest) => usersAdminApi.createUser(data),
    onSuccess: async (result) => {
      closeDialog();
      handleIssued(result, 'Użytkownik został utworzony');
      await invalidateUsers();
    },
    onError: (err) => setError(errorMessage(err, 'Nie udało się utworzyć użytkownika')),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateUserRequest }) => usersAdminApi.updateUser(id, data),
    onSuccess: async () => {
      closeDialog();
      showSuccess('Użytkownik został zaktualizowany');
      await invalidateUsers();
    },
    onError: (err) => setError(errorMessage(err, 'Nie udało się zaktualizować użytkownika')),
  });

  const resetPasswordMutation = useMutation({
    mutationFn: (id: number) => usersAdminApi.resetPassword(id),
    onSuccess: (result) => {
      closeDialog();
      handleIssued(result, 'Hasło zostało zresetowane');
    },
    onError: (err) => setError(errorMessage(err, 'Nie udało się zresetować hasła')),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => usersAdminApi.deleteUser(id),
    onSuccess: async () => {
      closeDialog();
      showSuccess('Użytkownik został usunięty');
      await invalidateUsers();
    },
    onError: (err) => setError(errorMessage(err, 'Nie udało się usunąć użytkownika')),
  });

  const openWith = (kind: DialogKind, user: AdminUser | null = null) => {
    setError(null);
    setSelectedUser(user);
    setOpenDialog(kind);
  };

  const handleFormSubmit = (values: UserFormValues) => {
    if (openDialog === 'create') {
      createMutation.mutate({
        email: values.email,
        name: values.name || undefined,
        roles: values.roles,
        studentId: values.studentId,
      });
    } else if (openDialog === 'edit' && selectedUser) {
      const data: UpdateUserRequest = {
        email: values.email,
        name: values.name || null,
        roles: values.roles,
        studentId: values.studentId,
      };
      // Editing never touches the password — that's "Resetuj hasło" only.
      updateMutation.mutate({ id: selectedUser.id, data });
    }
  };

  if (isLoading) {
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
        <Button variant="contained" startIcon={<PersonAddIcon />} onClick={() => openWith('create')}>
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
                      <Chip key={role} label={getRoleLabel(role)} color={getRoleColor(role)} size="small" />
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
                    <IconButton onClick={() => openWith('edit', user)} size="small">
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Resetuj hasło">
                    <IconButton onClick={() => openWith('reset', user)} size="small">
                      <LockResetIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Usuń">
                    <IconButton onClick={() => openWith('delete', user)} size="small" color="error">
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

      <UserFormDialog
        open={openDialog === 'create' || openDialog === 'edit'}
        mode={openDialog === 'edit' ? 'edit' : 'create'}
        user={selectedUser}
        loading={createMutation.isPending || updateMutation.isPending}
        onClose={closeDialog}
        onSubmit={handleFormSubmit}
      />

      <ResetPasswordDialog
        open={openDialog === 'reset'}
        user={selectedUser}
        loading={resetPasswordMutation.isPending}
        onClose={closeDialog}
        onSubmit={() => {
          if (selectedUser) resetPasswordMutation.mutate(selectedUser.id);
        }}
      />

      <TempPasswordDialog result={issued} onClose={() => setIssued(null)} />

      <DeleteUserDialog
        open={openDialog === 'delete'}
        user={selectedUser}
        loading={deleteMutation.isPending}
        onClose={closeDialog}
        onConfirm={() => {
          if (selectedUser) deleteMutation.mutate(selectedUser.id);
        }}
      />
    </Box>
  );
};

export default UsersManagement;
