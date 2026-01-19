import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import SaveIcon from '@mui/icons-material/Save';
import { settingsApi } from '../../api/endpoints/settings';
import { useSettings } from '../../context/Settings';

const Administration: React.FC = () => {
  const { settings, reload } = useSettings();
  const [formData, setFormData] = useState({
    institutionName: '',
    currency: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormData({
        institutionName: settings.institutionName || '',
        currency: settings.currency || '',
      });
    }
  }, [settings]);

  const handleChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [field]: event.target.value }));
    setError(null);
    setSuccess(false);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      await settingsApi.updateSettings(formData);
      await reload();
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nie udało się zapisać ustawień');
      console.error('Error saving settings:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3, width: '100%', maxWidth: 800, margin: '0 auto' }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Administracja
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Ustawienia zostały zapisane pomyślnie
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 3 }}>
          Ustawienia globalne
        </Typography>

        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <TextField
              fullWidth
              label="Nazwa instytucji"
              value={formData.institutionName}
              onChange={handleChange('institutionName')}
              disabled={loading}
              helperText="Nazwa Twojej szkoły, akademii lub instytucji"
            />

            <TextField
              fullWidth
              label="Waluta"
              value={formData.currency}
              onChange={handleChange('currency')}
              disabled={loading}
              helperText="np. PLN, EUR, USD"
              placeholder="PLN"
              sx={{ maxWidth: 300 }}
            />

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                type="submit"
                variant="contained"
                startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                disabled={loading}
              >
                Zapisz
              </Button>
            </Box>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
};

export default Administration;
