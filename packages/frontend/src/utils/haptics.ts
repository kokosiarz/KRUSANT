/**
 * Short vibrations for touch interactions that change something or ask for a
 * decision — the week turning under a swipe, a class being dropped on a new
 * slot, a delete confirmation appearing.
 *
 * **iOS does not implement the Vibration API**, in any browser (they are all
 * WebKit), and there is no web-exposed alternative — so on an iPhone every
 * call here is a no-op. This is deliberately not worked around: the documented
 * hacks rely on side effects of unrelated elements and break between releases.
 * Treat haptics as an Android-only enhancement, never as the only feedback for
 * an action.
 *
 * Keep the durations short. Anything long enough to notice as a buzz reads as
 * a malfunction rather than a response.
 */
function buzz(pattern: number | number[]): void {
  if (typeof navigator === 'undefined' || typeof navigator.vibrate !== 'function') {
    return;
  }
  try {
    navigator.vibrate(pattern);
  } catch {
    // Some browsers throw when vibrating without a prior user gesture. The
    // feedback is decorative, so a failure here must never surface.
  }
}

export const haptics = {
  /** A threshold was crossed or a boundary passed — the lightest possible tick. */
  tick: () => buzz(8),
  /** Something was committed: a drop landed, a week turned. */
  impact: () => buzz(16),
  /** A destructive decision is being asked for. Two pulses, so it doesn't read as "done". */
  warn: () => buzz([12, 60, 12]),
};

export default haptics;
