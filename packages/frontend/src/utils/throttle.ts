export function throttle(fn: (...args: any[]) => void, wait: number) {
  let lastCall = 0;
  let timeout: NodeJS.Timeout | null = null;
  let lastArgs: any[];
  return function (...args: any[]) {
    lastArgs = args;
    const now = Date.now();
    if (now - lastCall >= wait) {
      lastCall = now;
      fn(...args);
    } else {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => {
        lastCall = Date.now();
        fn(...lastArgs);
      }, wait - (now - lastCall));
    }
  };
}

export default throttle;
