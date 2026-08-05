import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { vi } from 'vitest';
import SwipeableCalendar from './SwipeableCalendar';

// The carousel's own arithmetic is what's under test — which periods are
// mounted, and which way a swipe moves them. Rendering three real calendars in
// jsdom would test FullCalendar instead, and slowly.
vi.mock('@fullcalendar/react', () => ({
  default: ({ initialDate }: { initialDate: Date }) => {
    // Local parts, not toISOString(): FullCalendar reads initialDate in local
    // time, and a month anchor is local midnight — printing it as UTC would
    // report the previous day everywhere east of Greenwich.
    const d = new Date(initialDate);
    const pad = (n: number) => String(n).padStart(2, '0');
    return (
      <div data-testid="pane">{`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`}</div>
    );
  },
}));

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver ??= ResizeObserverStub as unknown as typeof ResizeObserver;

/** The dates of the three mounted panes, in DOM order: previous, current, next. */
const paneDates = () => screen.getAllByTestId('pane').map((el) => el.textContent);

function swipe(dx: number) {
  const viewport = screen.getByTestId('calendar-viewport');
  fireEvent.touchStart(viewport, { touches: [{ clientX: 200, clientY: 200 }] });
  fireEvent.touchMove(viewport, { touches: [{ clientX: 200 + dx, clientY: 200 }] });
  fireEvent.touchEnd(viewport, { changedTouches: [{ clientX: 200 + dx, clientY: 200 }] });
  // Let the settle animation's timer fire, which is what hands over to the
  // neighbouring period.
  act(() => {
    vi.advanceTimersByTime(1000);
  });
}

describe('SwipeableCalendar', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-08-05T10:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const renderCalendar = () => render(<SwipeableCalendar events={[]} />);

  it('mounts the neighbouring weeks either side of the current one, so they are already there to swipe to', () => {
    renderCalendar();
    expect(paneDates()).toEqual(['2026-07-29', '2026-08-05', '2026-08-12']);
  });

  it('swiping left moves forward a week', () => {
    renderCalendar();
    swipe(-120);
    expect(paneDates()).toEqual(['2026-08-05', '2026-08-12', '2026-08-19']);
  });

  it('swiping right moves back a week', () => {
    renderCalendar();
    swipe(120);
    expect(paneDates()).toEqual(['2026-07-22', '2026-07-29', '2026-08-05']);
  });

  it('a drag shorter than the threshold springs back instead of changing week', () => {
    renderCalendar();
    swipe(-20);
    expect(paneDates()).toEqual(['2026-07-29', '2026-08-05', '2026-08-12']);
  });

  it('ignores a mostly-vertical drag, which is the agenda being scrolled', () => {
    renderCalendar();
    const viewport = screen.getByTestId('calendar-viewport');
    fireEvent.touchStart(viewport, { touches: [{ clientX: 200, clientY: 200 }] });
    fireEvent.touchMove(viewport, { touches: [{ clientX: 130, clientY: 400 }] });
    fireEvent.touchEnd(viewport, { changedTouches: [{ clientX: 130, clientY: 400 }] });
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(paneDates()).toEqual(['2026-07-29', '2026-08-05', '2026-08-12']);
  });

  it('steps by month, not by week, once the month view is selected', () => {
    renderCalendar();
    fireEvent.click(screen.getByRole('button', { name: 'Miesiąc' }));
    // Month anchors normalise to the 1st so the arithmetic can't skid off a 31st.
    expect(paneDates()).toEqual(['2026-07-01', '2026-08-01', '2026-09-01']);

    swipe(-120);
    expect(paneDates()).toEqual(['2026-08-01', '2026-09-01', '2026-10-01']);
  });

  it('the header arrows move the same way as the swipe', () => {
    renderCalendar();

    fireEvent.click(screen.getByRole('button', { name: 'Następny okres' }));
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(paneDates()).toEqual(['2026-08-05', '2026-08-12', '2026-08-19']);

    fireEvent.click(screen.getByRole('button', { name: 'Poprzedni okres' }));
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(paneDates()).toEqual(['2026-07-29', '2026-08-05', '2026-08-12']);
  });

  it('"Dziś" comes back to the current week after drifting away', () => {
    renderCalendar();
    swipe(-120);
    swipe(-120);
    expect(paneDates()).toEqual(['2026-08-12', '2026-08-19', '2026-08-26']);

    fireEvent.click(screen.getByRole('button', { name: 'Dziś' }));
    expect(paneDates()).toEqual(['2026-07-29', '2026-08-05', '2026-08-12']);
  });
});
