// `margin` gives a drag that ends just barely outside the calendar (a few
// pixels, easy to do by accident on a trackpad) some slack before it counts
// as "dropped outside" — this check gates the delete-confirmation prompt in
// Classes/index.tsx, so a near-miss shouldn't surface a destructive-looking dialog.
export const isInside = (
  jsEvent: MouseEvent,
  containerId: string,
  margin = 40,
): boolean => {
  const rect = window.document
    .getElementById(containerId)
    ?.getBoundingClientRect();
  return (
    rect !== undefined &&
    jsEvent.clientX > rect.x - margin &&
    jsEvent.clientX < rect.x + rect.width + margin &&
    jsEvent.clientY > rect.y - margin &&
    jsEvent.clientY < rect.y + rect.height + margin
  );
};