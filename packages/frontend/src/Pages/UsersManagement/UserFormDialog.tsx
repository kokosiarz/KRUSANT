import React, { useEffect, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import CircularProgress from '@mui/material/CircularProgress';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import { useQuery } from '@tanstack/react-query';
import { AdminUser } from '@/api/endpoints/usersAdmin';
import { studentsApi } from '@/api/endpoints/students';
import { AVAILABLE_ROLES, getRoleLabel } from './roleLabels';

// No password field: on create the server generates a temporary one and emails
// it, and an existing password is only ever replaced via "Resetuj hasło" (which
// issues a fresh temporary one). An admin never types a user's password.
export interface UserFormValues {
  email: string;
  name: string;
  roles: string[];
  studentId: number | null;
}

interface UserFormDialogProps {
  open: boolean;
  mode: 'create' | 'edit';
  user?: AdminUser | null;
  loading: boolean;
  onClose: () => void;
  onSubmit: (values: UserFormValues) => void;
}

const emptyValues: UserFormValues = { email: '', name: '', roles: [], studentId: null };

const UserFormDialog: React.FC<UserFormDialogProps> = ({ open, mode, user, loading, onClose, onSubmit }) => {
  const [values, setValues] = useState<UserFormValues>(emptyValues);

  const { data: students = [] } = useQuery({
    queryKey: ['students'],
    queryFn: studentsApi.getStudents,
    enabled: open,
  });

  useEffect(() => {
    if (!open) return;
    setValues(
      mode === 'edit' && user
        ? {
            email: user.email,
            name: user.name ?? '',
            roles: user.roles || [],
            studentId: user.studentId ?? null,
          }
        : emptyValues,
    );
  }, [open, mode, user]);

  const toggleRole = (role: string) => {
    setValues((prev) => ({
      ...prev,
      roles: prev.roles.includes(role) ? prev.roles.filter((r) => r !== role) : [...prev.roles, role],
    }));
  };

  const isValid = !!values.email;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{mode === 'create' ? 'Dodaj użytkownika' : 'Edytuj użytkownika'}</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={values.email}
            onChange={(e) => setValues((prev) => ({ ...prev, email: e.target.value }))}
            disabled={loading}
          />
          <TextField
            fullWidth
            label="Imię i nazwisko"
            value={values.name}
            onChange={(e) => setValues((prev) => ({ ...prev, name: e.target.value }))}
            disabled={loading}
            helperText="Wyświetlane w aplikacji i na listach nauczycieli"
          />
          {mode === 'create' && (
            <Alert severity="info">
              Użytkownik otrzyma e-mail z hasłem tymczasowym, które musi zmienić
              w ciągu 24 godzin.
            </Alert>
          )}
          <FormControl component="fieldset">
            <Typography variant="subtitle2" sx={{ mb: 1 }}>Role</Typography>
            <FormGroup row>
              {AVAILABLE_ROLES.map((role) => (
                <FormControlLabel
                  key={role}
                  control={
                    <Checkbox
                      checked={values.roles.includes(role)}
                      onChange={() => toggleRole(role)}
                      disabled={loading}
                    />
                  }
                  label={getRoleLabel(role)}
                />
              ))}
            </FormGroup>
          </FormControl>
          <FormControl fullWidth disabled={loading}>
            <InputLabel id="user-student-label">Powiąż z kursantem</InputLabel>
            <Select
              labelId="user-student-label"
              label="Powiąż z kursantem"
              value={values.studentId !== null ? String(values.studentId) : ''}
              onChange={(e) =>
                setValues((prev) => ({ ...prev, studentId: e.target.value === '' ? null : Number(e.target.value) }))
              }
            >
              <MenuItem value="">Brak</MenuItem>
              {students.map((s: any) => (
                <MenuItem key={s.id} value={String(s.id)}>{s.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Anuluj
        </Button>
        <Button onClick={() => onSubmit(values)} variant="contained" disabled={loading || !isValid}>
          {loading ? <CircularProgress size={20} /> : mode === 'create' ? 'Utwórz' : 'Zapisz'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserFormDialog;
