import React, { useEffect, useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import InstallMobileIcon from '@mui/icons-material/InstallMobile';
import { applyPendingUpdate, initPwa } from '@/pwa';
import { usePwaInstall } from '@hooks/usePwaInstall';
import IosInstallDialog from './IosInstallDialog';

export const DISMISSED_KEY = 'krusant.installPromptDismissedAt';
/** How long a "not now" is respected before we offer again. */
const DISMISS_DAYS = 30;

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
 * Only the *banner* respects the dismissal — the install event itself is
 * captured in `pwa.ts` from the moment the app loads, so declining here doesn't
 * take the option away. The profile panel offers it permanently, which is where
 * someone who said "not now" goes when they change their mind.
 */
const PwaPrompts: React.FC = () => {
  const { canInstall, justInstalled, installable, ios, promptInstall } = usePwaInstall();
  const [showIosHelp, setShowIosHelp] = useState(false);
  const [updateReady, setUpdateReady] = useState(false);
  const [dismissed, setDismissed] = useState(recentlyDismissed);
  const [installedNoticeClosed, setInstalledNoticeClosed] = useState(false);

  useEffect(() => {
    initPwa(() => setUpdateReady(true));
  }, []);

  const dismiss = () => {
    localStorage.setItem(DISMISSED_KEY, String(Date.now()));
    setDismissed(true);
  };

  const install = async () => {
    const outcome = await promptInstall();
    // A declined native prompt counts as "not now" — re-offering on the next
    // page load would be nagging.
    if (outcome === 'dismissed') dismiss();
  };

  const offering = installable && !dismissed;

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
                    onClick={() => (canInstall ? void install() : setShowIosHelp(true))}
                  >
                    {canInstall ? 'Zainstaluj' : 'Jak zainstalować?'}
                  </Button>
                  <Button size="small" onClick={dismiss}>
                    Nie teraz
                  </Button>
                </Stack>
                {/* Says where it went, so "not now" isn't a dead end. */}
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 1 }}>
                  Później znajdziesz tę opcję w panelu profilu.
                </Typography>
              </Box>
              <IconButton size="small" onClick={dismiss} aria-label="Zamknij">
                <CloseIcon fontSize="small" />
              </IconButton>
            </Stack>
          </Paper>
        </Box>
      )}

      {ios && <IosInstallDialog open={showIosHelp} onClose={() => setShowIosHelp(false)} />}

      <Snackbar
        open={justInstalled && !installedNoticeClosed}
        autoHideDuration={5000}
        onClose={() => setInstalledNoticeClosed(true)}
      >
        <Alert severity="success" onClose={() => setInstalledNoticeClosed(true)}>
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
