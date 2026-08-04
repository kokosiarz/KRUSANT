import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import DeleteIcon from '@mui/icons-material/Delete';
import FingerprintIcon from '@mui/icons-material/Fingerprint';
import { passkeysApi, passkeysSupported } from '@api/endpoints/passkeys';

const dateFmt = new Intl.DateTimeFormat('pl-PL', { dateStyle: 'medium' });

/**
 * Manage this account's passkeys.
 *
 * Registration has to happen from an already-authenticated session — that is
 * what ties the new credential to a known account, and it's why this lives
 * behind the profile panel rather than on the login screen.
 */
const PasskeySection: React.FC = () => {
    const queryClient = useQueryClient();
    const [error, setError] = useState<string | null>(null);
    const supported = passkeysSupported();

    const { data: keys = [], isLoading } = useQuery({
        queryKey: ['passkeys'],
        queryFn: passkeysApi.list,
        enabled: supported,
    });

    const invalidate = () => queryClient.invalidateQueries({ queryKey: ['passkeys'] });

    const addMutation = useMutation({
        mutationFn: () =>
            // Labelled with the device it was created on, so a user with several
            // can tell which is which later.
            passkeysApi.register(deviceLabel()),
        onSuccess: async () => {
            setError(null);
            await invalidate();
        },
        onError: (err: Error & { name?: string }) => {
            if (err.name === 'NotAllowedError' || err.name === 'AbortError') return;
            setError(err.message || 'Nie udało się dodać klucza');
        },
    });

    const removeMutation = useMutation({
        mutationFn: (id: number) => passkeysApi.remove(id),
        onSuccess: async () => {
            setError(null);
            await invalidate();
        },
        onError: (err: Error) => setError(err.message || 'Nie udało się usunąć klucza'),
    });

    if (!supported) return null;

    return (
        <Box sx={{ px: 2, py: 2 }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 0.5 }}>
                <FingerprintIcon fontSize="small" color="primary" />
                <Typography variant="subtitle2" sx={{ fontWeight: 650 }}>
                    Klucze dostępu
                </Typography>
            </Stack>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1.5 }}>
                Loguj się przez Face ID lub Touch ID, bez wpisywania hasła.
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 1.5 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            {isLoading ? (
                <CircularProgress size={20} />
            ) : (
                <Stack spacing={1} sx={{ mb: 1.5 }}>
                    {keys.length === 0 && (
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            Brak zapisanych kluczy.
                        </Typography>
                    )}
                    {keys.map((k) => (
                        <Stack
                            key={k.id}
                            direction="row"
                            spacing={1}
                            sx={{ alignItems: 'center', justifyContent: 'space-between' }}
                        >
                            <Box sx={{ minWidth: 0 }}>
                                <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                                    {k.label}
                                </Typography>
                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                    {dateFmt.format(new Date(k.createdAt))}
                                    {k.lastUsedAt ? ` · użyty ${dateFmt.format(new Date(k.lastUsedAt))}` : ''}
                                </Typography>
                            </Box>
                            <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                                {k.backedUp && (
                                    <Tooltip title="Zsynchronizowany — działa też na Twoich innych urządzeniach">
                                        <Chip size="small" label="sync" variant="outlined" />
                                    </Tooltip>
                                )}
                                <IconButton
                                    size="small"
                                    color="error"
                                    disabled={removeMutation.isPending}
                                    onClick={() => removeMutation.mutate(k.id)}
                                    aria-label={`Usuń klucz ${k.label}`}
                                >
                                    <DeleteIcon fontSize="small" />
                                </IconButton>
                            </Stack>
                        </Stack>
                    ))}
                </Stack>
            )}

            <Button
                size="small"
                variant="outlined"
                fullWidth
                startIcon={<FingerprintIcon />}
                disabled={addMutation.isPending}
                onClick={() => addMutation.mutate()}
            >
                {addMutation.isPending ? 'Czekam na potwierdzenie…' : 'Dodaj klucz dostępu'}
            </Button>
        </Box>
    );
};

/** Best-effort device name so a list of keys is readable. */
function deviceLabel(): string {
    const ua = navigator.userAgent;
    if (/iphone/i.test(ua)) return 'iPhone';
    if (/ipad/i.test(ua)) return 'iPad';
    if (/macintosh|mac os/i.test(ua)) return 'Mac';
    if (/android/i.test(ua)) return 'Android';
    if (/windows/i.test(ua)) return 'Windows';
    return 'Klucz dostępu';
}

export default PasskeySection;
