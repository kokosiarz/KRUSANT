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
import { useQuery } from '@tanstack/react-query';
import { AdminUser } from '@/api/endpoints/usersAdmin';
import { teachersApi } from '@/api/endpoints/teachers';
import { studentsApi } from '@/api/endpoints/students';
import { AVAILABLE_ROLES, getRoleLabel } from './roleLabels';

export interface UserFormValues {
  email: string;
  password: string;
  roles: string[];
  teacherId: number | null;
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

const emptyValues: UserFormValues = { email: '', password: '', roles: [], teacherId: null, studentId: null };

const UserFormDialog: React.FC<UserFormDialogProps> = ({ open, mode, user, loading, onClose, onSubmit }) => {
  const [values, setValues] = useState<UserFormValues>(emptyValues);

  const { data: teachers = [] } = useQuery({
    queryKey: ['teachers'],
    queryFn: teachersApi.getTeachers,
    enabled: open,
  });
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
            password: '',
            roles: user.roles || [],
            teacherId: user.teacherId ?? null,
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

  const isValid = mode === 'create' ? !!values.email && !!values.password : !!values.email;

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
            label={mode === 'create' ? 'Hasło' : 'Nowe hasło (opcjonalne)'}
            type="password"
            value={values.password}
            onChange={(e) => setValues((prev) => ({ ...prev, password: e.target.value }))}
            disabled={loading}
            helperText={mode === 'edit' ? 'Pozostaw puste, aby nie zmieniać hasła' : undefined}
          />
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
            <InputLabel id="user-teacher-label">Powiąż z nauczycielem</InputLabel>
            <Select
              labelId="user-teacher-label"
              label="Powiąż z nauczycielem"
              value={values.teacherId !== null ? String(values.teacherId) : ''}
              onChange={(e) =>
                setValues((prev) => ({ ...prev, teacherId: e.target.value === '' ? null : Number(e.target.value) }))
              }
            >
              <MenuItem value="">Brak</MenuItem>
              {teachers.map((t) => (
                <MenuItem key={t.id} value={String(t.id)}>{t.name}</MenuItem>
              ))}
            </Select>
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
