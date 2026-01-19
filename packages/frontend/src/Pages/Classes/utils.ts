export const isInside = (
  jsEvent: MouseEvent,
  containerId: string
): boolean => {
  const rect = window.document
    .getElementById(containerId)
    ?.getBoundingClientRect();
  return (
    rect !== undefined &&
    jsEvent.clientX > rect.x &&
    jsEvent.clientX < rect.x + rect.width &&
    jsEvent.clientY > rect.y &&
    jsEvent.clientY < rect.y + rect.height
  );
};