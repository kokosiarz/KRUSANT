import {
  Box,
  Card,
  CardContent,
  Skeleton,
  Stack,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import { useDebtorStudents } from './datasource';

const formatPLN = (value: number) =>
  new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: 'PLN',
    minimumFractionDigits: 2,
  }).format(value);

interface DebtorRowProps {
  name: string;
  balance: number;
}

const DebtorRow = ({ name, balance }: DebtorRowProps) => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        py: 1,
        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
        '&:last-child': { borderBottom: 'none' },
      }}
    >
      <Typography
        variant="body2"
        sx={{ color: 'text.secondary', fontWeight: 500 }}
      >
        {name}
      </Typography>
      <Typography
        variant="body1"
        sx={{ fontWeight: 600, color: theme.palette.error.main }}
      >
        {formatPLN(balance)}
      </Typography>
    </Box>
  );
};

export default function FinancialSummaryWidget() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { debtors, totalDebt, isLoading, error } = useDebtorStudents();

  const accentColor = theme.palette.error.main;

  return (
    <Box>
      <Typography
        variant="h6"
        sx={{
          fontWeight: 600,
          mb: 2.5,
          color: 'text.primary',
        }}
      >
        Zaległości finansowe
      </Typography>

      <Card
        elevation={0}
        sx={{
          maxWidth: 420,
          bgcolor: 'background.paper',
          border: `1px solid ${theme.palette.divider}`,
          transition: 'box-shadow 0.2s ease',
          '&:hover': {
            boxShadow: isDark
              ? `0 4px 20px ${alpha('#000', 0.3)}`
              : `0 4px 20px ${alpha('#000', 0.08)}`,
          },
        }}
      >
        <CardContent sx={{ p: 3 }}>
          {/* Header */}
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 2.5 }}>
            <Box
              sx={{
                width: 8,
                height: 32,
                borderRadius: 1,
                bgcolor: accentColor,
              }}
            />
            <Box>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 700,
                  color: 'text.primary',
                  lineHeight: 1.2,
                }}
              >
                Kursanci z ujemnym saldem
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: 'text.secondary', fontSize: '0.7rem' }}
              >
                Podsumowanie
              </Typography>
            </Box>
          </Stack>

          {/* Summary */}
          {isLoading ? (
            <Skeleton variant="rounded" height={56} sx={{ mb: 2.5 }} />
          ) : error ? (
            <Box
              sx={{
                p: 2,
                mb: 2.5,
                borderRadius: 1.5,
                bgcolor: alpha(theme.palette.error.main, 0.1),
              }}
            >
              <Typography variant="body2" color="error">
                Błąd ładowania danych
              </Typography>
            </Box>
          ) : (
            <Box sx={{ mb: 2.5 }}>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  color: 'text.primary',
                  lineHeight: 1,
                }}
              >
                {debtors.length}
                <Typography
                  component="span"
                  variant="body1"
                  sx={{ fontWeight: 500, color: 'text.secondary', ml: 1 }}
                >
                  {debtors.length === 1
                    ? 'kursant'
                    : debtors.length >= 2 && debtors.length <= 4
                      ? 'kursantów'
                      : 'kursantów'}
                </Typography>
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: accentColor,
                  mt: 0.5,
                  display: 'block',
                  fontWeight: 600,
                }}
              >
                Łącznie: {formatPLN(totalDebt)}
              </Typography>
            </Box>
          )}

          {/* Debtor list */}
          {!isLoading && !error && debtors.length > 0 && (
            <Box
              sx={{
                pt: 2,
                borderTop: `1px solid ${theme.palette.divider}`,
              }}
            >
              <Typography
                variant="overline"
                sx={{
                  color: 'text.secondary',
                  fontSize: '0.65rem',
                  letterSpacing: 0.5,
                  mb: 1,
                  display: 'block',
                }}
              >
                Szczegóły
              </Typography>

              {debtors.map((student) => (
                <DebtorRow
                  key={student.id}
                  name={student.name}
                  balance={student.balance}
                />
              ))}
            </Box>
          )}

          {!isLoading && !error && debtors.length === 0 && (
            <Typography
              variant="body2"
              sx={{ color: 'text.secondary', textAlign: 'center', py: 2 }}
            >
              Brak zaległości — wszyscy kursanci rozliczeni ✓
            </Typography>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}