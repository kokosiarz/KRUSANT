import React, { useEffect, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import MenuItem from '@mui/material/MenuItem';
import { studentsApi } from '../../api/endpoints/students';
import { ApiClientError } from '../../api/client';
import { StudentFormProps, StudentFormData } from './types';

const SEMESTERS = ['I', 'II', 'III', 'IV', 'V', 'VI'];

const StudentForm: React.FC<StudentFormProps> = ({ open, onClose, studentId, onSuccess }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailCheckWarning, setEmailCheckWarning] = useState<string | null>(null);
  const [validatingEmail, setValidatingEmail] = useState<boolean>(false);
  const [formData, setFormData] = useState<StudentFormData>({
    name: '',
    email: '',
    phone: '',
    discount: 0,
    semester: 'I',
    extraNotes: '',
    active: true,
  });

  // Load student data if editing
  useEffect(() => {
    if (studentId && open) {
      const loadStudent = async () => {
        try {
          setLoading(true);
          setError(null);
          const student = await studentsApi.getStudentById(studentId);
          setFormData({
            name: student.name,
            email: student.email,
            phone: student.phone || '',
            discount: student.discount || undefined,
            semester: student.semester,
            extraNotes: student.extraNotes,
            active: student.active,
          });
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Nie udało się wczytać kursanta');
        } finally {
          setLoading(false);
        }
      };
      loadStudent();
    } else if (open && !studentId) {
      // Reset form for new student
      setFormData({
        name: '',
        email: '',
        phone: '',
        discount: 0,
        semester: 'I',
        extraNotes: '',
        active: true,
      });
    }
  }, [studentId, open]);

  // Debounced email validation
  const validateEmail = React.useCallback(
    async (email: string) => {
      if (!email) {
        setEmailError(null);
        setEmailCheckWarning(null);
        return;
      }

      setValidatingEmail(true);
      setEmailCheckWarning(null);
      try {
        await studentsApi.searchStudentByEmail(email);
        // If we get here, a student with this email exists
        // But it's OK if it's the same student we're editing
        if (studentId) {
          const currentStudent = await studentsApi.getStudentById(studentId);
          if (currentStudent.email === email) {
            setEmailError(null);
          } else {
            setEmailError('Kursant z tym adresem email już istnieje');
          }
        } else {
          setEmailError('Kursant z tym adresem email już istnieje');
        }
      } catch (err) {
        if (err instanceof ApiClientError && err.statusCode === 404) {
          // Genuinely not found - the email is available.
          setEmailError(null);
        } else {
          // Couldn't actually verify (network/server error) - say so instead
          // of silently treating an unknown result as "available".
          setEmailError(null);
          setEmailCheckWarning('Nie udało się zweryfikować unikalności adresu email');
        }
      } finally {
        setValidatingEmail(false);
      }
    },
    [studentId]
  );

  // Debounce email validation
  React.useEffect(() => {
    const timer = setTimeout(() => {
      validateEmail(formData.email);
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.email, validateEmail]);

  const handleChange = (field: keyof StudentFormData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.type === 'checkbox' 
      ? event.target.checked 
      : event.target.value;
    
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNumberChange = (field: keyof StudentFormData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value === '' ? undefined : Number(event.target.value);
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      if (studentId) {
        // Update existing student
        await studentsApi.updateStudent(studentId, {
          name: formData.name,
          email: formData.email,
          phone: formData.phone || undefined,
          discount: formData.discount,
          semester: formData.semester,
          extraNotes: formData.extraNotes,
          active: formData.active,
        });
      } else {
        // Create new student
        await studentsApi.createStudent({
          name: formData.name,
          email: formData.email,
          phone: formData.phone || undefined,
          payments: [],
          classes: [],
          discount: formData.discount,
          semester: formData.semester,
          extraNotes: formData.extraNotes,
          active: formData.active,
        });
      }
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nie udało się zapisać kursanta');
    } finally {
      setLoading(false);
    }
  };

  const isEmailFormatValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
  const isFormValid = formData.name && formData.email && isEmailFormatValid && formData.semester;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {studentId ? 'Edytuj dane kursanta' : 'Dodaj nowego kursanta'}
      </DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label="Imię i nazwisko"
            required
            fullWidth
            value={formData.name}
            onChange={handleChange('name')}
            disabled={loading}
          />
          
          <TextField
            label="Email"
            type="email"
            required
            fullWidth
            value={formData.email}
            onChange={handleChange('email')}
            disabled={loading}
            error={!!emailError}
            helperText={emailError || emailCheckWarning || (validatingEmail ? 'Sprawdzanie email...' : '')}
          />
          
          <TextField
            label="Telefon"
            fullWidth
            value={formData.phone}
            onChange={handleChange('phone')}
            disabled={loading}
          />
          
          <TextField
            label="Semestr"
            required
            fullWidth
            select
            value={formData.semester}
            onChange={handleChange('semester')}
            disabled={loading}
          >
            {SEMESTERS.map((semester) => (
              <MenuItem key={semester} value={semester}>
                {semester}
              </MenuItem>
            ))}
          </TextField>
          
          <TextField
            label="Zniżka (%)"
            type="number"
            fullWidth
            value={formData.discount ?? ''}
            onChange={handleNumberChange('discount')}
            disabled={loading}
          />
          
          <TextField
            label="Dodatkowe notatki"
            multiline
            rows={3}
            fullWidth
            value={formData.extraNotes}
            onChange={handleChange('extraNotes')}
            disabled={loading}
          />
          
          <FormControlLabel
            control={
              <Switch
                checked={formData.active}
                onChange={handleChange('active')}
                disabled={loading}
              />
            }
            label="Aktywny"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Anuluj
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || !isFormValid || !!emailError}
        >
          {loading ? <CircularProgress size={24} /> : studentId ? 'Zapisz' : 'Utwórz'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default StudentForm;
