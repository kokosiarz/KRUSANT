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
import { useMetalPrices } from './datasource';

// Pricing algorithm: 1.5x markup
const calculateRetailPrice = (basePrice: number) => 1.5 * basePrice;

interface PurityRowProps {
  label: string;
  price: number;
}

const PurityRow = ({ label, price }: PurityRowProps) => {
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
        {label}
      </Typography>
      <Typography
        variant="body1"
        sx={{ fontWeight: 600, color: 'text.primary' }}
      >
        {Math.round(price)} PLN
      </Typography>
    </Box>
  );
};

interface MetalCardProps {
  metal: 'gold' | 'silver';
  title: string;
  accentColor: string;
  purities: { label: string; multiplier: number }[];
}

const MetalCard = ({ metal, title, accentColor, purities }: MetalCardProps) => {
  const theme = useTheme();
  const { data, isLoading, error } = useMetalPrices(metal);
  const isDark = theme.palette.mode === 'dark';

  const baseRetailPrice = data ? calculateRetailPrice(data.price) : 0;

  return (
    <Card
      elevation={0}
      sx={{
        flex: 1,
        minWidth: 260,
        maxWidth: 360,
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
        <Stack direction="row" alignItems="center" spacing={1.5} mb={2.5}>
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
              sx={{ fontWeight: 700, color: 'text.primary', lineHeight: 1.2 }}
            >
              {title}
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: 'text.secondary', fontSize: '0.7rem' }}
            >
              Kurs NBP
            </Typography>
          </Box>
        </Stack>

        {/* NBP Price */}
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
              sx={{ fontWeight: 700, color: 'text.primary', lineHeight: 1 }}
            >
              {data?.price.toFixed(2)}{' '}
              <Typography
                component="span"
                variant="body1"
                sx={{ fontWeight: 500, color: 'text.secondary' }}
              >
                PLN/g
              </Typography>
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: 'text.secondary', mt: 0.5, display: 'block' }}
            >
              {data?.date}
            </Typography>
          </Box>
        )}

        {/* Retail Prices */}
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
            Cena detaliczna
          </Typography>

          {purities.map((purity) => (
            <PurityRow
              key={purity.label}
              label={purity.label}
              price={baseRetailPrice * purity.multiplier}
            />
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};

export default function MetalPricesWidget() {
  const theme = useTheme();

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
        Metale szlachetne
      </Typography>

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{ alignItems: { xs: 'stretch', sm: 'flex-start' } }}
      >
        <MetalCard
          metal="gold"
          title="Złoto"
          accentColor={theme.palette.mode === 'dark' ? '#D4AF37' : '#B8960C'}
          purities={[
            { label: 'Au 999', multiplier: 1 },
            { label: 'Au 585', multiplier: 0.585 },
            { label: 'Au 333', multiplier: 0.333 },
            { label: 'Lut', multiplier: 0.6 },
          ]}
        />

        <MetalCard
          metal="silver"
          title="Srebro"
          accentColor={theme.palette.mode === 'dark' ? '#A8A8A8' : '#6B6B6B'}
          purities={[{ label: 'Ag 999', multiplier: 1 }]}
        />
      </Stack>
    </Box>
  );
}