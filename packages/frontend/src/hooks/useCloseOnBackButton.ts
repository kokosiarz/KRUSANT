import { useEffect, useRef } from 'react';

/**
 * Makes the Android/browser back gesture close an open drawer instead of
 * leaving the page. While `open` is true it pushes a throwaway history entry;
 * a back navigation pops it (closing the drawer) instead of the real page.
 *
 * If the drawer closes some other way (X button, backdrop, swipe) the pushed
 * entry is popped again on cleanup — but only if it's still on top of the
 * stack, so a navigation that happened in the same tick (e.g. a menu item
 * click that both routes and closes the drawer) isn't undone by an errant
 * history.back().
 */
export function useCloseOnBackButton(open: boolean, onClose: () => void) {
  const closedViaPopState = useRef(false);

  useEffect(() => {
    if (!open) return;

    window.history.pushState({ krusantDrawer: true }, '');

    const handlePopState = () => {
      closedViaPopState.current = true;
      onClose();
    };
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      if (closedViaPopState.current) {
        closedViaPopState.current = false;
      } else if ((window.history.state as { krusantDrawer?: boolean } | null)?.krusantDrawer) {
        window.history.back();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
}
