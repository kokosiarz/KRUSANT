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
import { StudentFormProps, StudentFormData } from './types';

const SEMESTERS = ['I', 'II', 'III', 'IV', 'V', 'VI'];

const StudentForm: React.FC<StudentFormProps> = ({ open, onClose, studentId, onSuccess }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [validatingEmail, setValidatingEmail] = useState<boolean>(false);
  const [formData, setFormData] = useState<StudentFormData>({
    name: '',
    email: '',
    phone: '',
    customRate: undefined,
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
            customRate: student.customRate || undefined,
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
        customRate: undefined,
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
        return;
      }

      setValidatingEmail(true);
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
        // 404 error means email doesn't exist, which is good
        setEmailError(null);
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
          customRate: formData.customRate,
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
          customRate: formData.customRate,
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

  const isFormValid = formData.name && formData.email && formData.semester;

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
            helperText={emailError || (validatingEmail ? 'Sprawdzanie email...' : '')}
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
