import React, { useEffect, useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Paper from '@mui/material/Paper';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import InstallMobileIcon from '@mui/icons-material/InstallMobile';
import IosShareIcon from '@mui/icons-material/IosShare';
import { applyPendingUpdate, initPwa, isIos, isStandalone } from '@/pwa';

const DISMISSED_KEY = 'krusant.installPromptDismissedAt';
/** How long a "not now" is respected before we offer again. */
const DISMISS_DAYS = 30;

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const recentlyDismissed = () => {
  const raw = localStorage.getItem(DISMISSED_KEY);
  if (!raw) return false;
  const at = Number(raw);
  if (!Number.isFinite(at)) return false;
  return Date.now() - at < DISMISS_DAYS * 24 * 60 * 60 * 1000;
};

/**
 * Offers to install the app, and offers to reload when a new version is ready.
 *
 * Two paths, because they genuinely differ: Chromium fires
 * `beforeinstallprompt` and lets us trigger the real install dialog, while iOS
 * never has — there the only route is the Share sheet, so we show instructions
 * rather than a button that would do nothing.
 */
const PwaPrompts: React.FC = () => {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIosHelp, setShowIosHelp] = useState(false);
  const [iosEligible, setIosEligible] = useState(false);
  const [updateReady, setUpdateReady] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    initPwa(() => setUpdateReady(true));
  }, []);

  useEffect(() => {
    // Already installed, or told us to stop asking — say nothing.
    if (isStandalone() || recentlyDismissed()) return;

    const onBeforeInstall = (e: Event) => {
      // Suppressing the browser's own mini-infobar so the offer appears in the
      // app's own language and styling instead.
      e.preventDefault();
      setInstallEvent(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setInstallEvent(null);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onInstalled);

    // iOS gets the instructions banner, since no event will ever arrive.
    if (isIos()) setIosEligible(true);

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const dismiss = () => {
    localStorage.setItem(DISMISSED_KEY, String(Date.now()));
    setInstallEvent(null);
    setIosEligible(false);
  };

  const install = async () => {
    if (!installEvent) return;
    await installEvent.prompt();
    const { outcome } = await installEvent.userChoice;
    // A declined native prompt counts as "not now" — re-offering on the next
    // page load would be nagging.
    if (outcome === 'dismissed') localStorage.setItem(DISMISSED_KEY, String(Date.now()));
    setInstallEvent(null);
  };

  const offering = !!installEvent || iosEligible;

  return (
    <>
      {offering && (
        <Box
          sx={{
            position: 'fixed',
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: (t) => t.zIndex.snackbar,
            p: 2,
            display: 'flex',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}
        >
          <Paper
            elevation={6}
            sx={{
              pointerEvents: 'auto',
              p: 2,
              width: '100%',
              maxWidth: 460,
              border: 1,
              borderColor: 'divider',
              borderRadius: 3,
            }}
          >
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start' }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  flexShrink: 0,
                  display: 'grid',
                  placeItems: 'center',
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                }}
              >
                <InstallMobileIcon fontSize="small" />
              </Box>
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 650 }}>
                  Zainstaluj KRUSANT
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Dodaj aplikację do ekranu głównego — otwiera się jak zwykła
                  aplikacja, bez paska przeglądarki.
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => (installEvent ? void install() : setShowIosHelp(true))}
                  >
                    {installEvent ? 'Zainstaluj' : 'Jak zainstalować?'}
                  </Button>
                  <Button size="small" onClick={dismiss}>
                    Nie teraz
                  </Button>
                </Stack>
              </Box>
              <IconButton size="small" onClick={dismiss} aria-label="Zamknij">
                <CloseIcon fontSize="small" />
              </IconButton>
            </Stack>
          </Paper>
        </Box>
      )}

      <Dialog open={showIosHelp} onClose={() => setShowIosHelp(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Instalacja na iPhone / iPad</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
            Safari nie pozwala zainstalować aplikacji jednym przyciskiem — trzeba
            zrobić to z menu udostępniania.
          </Typography>
          <Stack spacing={1.5}>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
              <IosShareIcon fontSize="small" color="primary" />
              <Typography variant="body2">
                1. Dotknij ikony <strong>Udostępnij</strong> na dole ekranu.
              </Typography>
            </Stack>
            <Typography variant="body2">
              2. Wybierz <strong>Do ekranu początkowego</strong>.
            </Typography>
            <Typography variant="body2">
              3. Potwierdź przyciskiem <strong>Dodaj</strong>.
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowIosHelp(false)}>Zamknij</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={installed} autoHideDuration={5000} onClose={() => setInstalled(false)}>
        <Alert severity="success" onClose={() => setInstalled(false)}>
          KRUSANT został zainstalowany.
        </Alert>
      </Snackbar>

      {/* Never swaps versions under someone mid-edit — they choose when. */}
      <Snackbar open={updateReady} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert
          severity="info"
          action={
            <Button color="inherit" size="small" onClick={() => void applyPendingUpdate()}>
              Odśwież
            </Button>
          }
        >
          Dostępna jest nowa wersja aplikacji.
        </Alert>
      </Snackbar>
    </>
  );
};

export default PwaPrompts;
