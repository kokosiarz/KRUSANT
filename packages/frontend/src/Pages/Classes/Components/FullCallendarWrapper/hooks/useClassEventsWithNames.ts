import React from 'react';
import { useTheme } from '@mui/material/styles';
import { useQuery } from '@tanstack/react-query';
import { groupsApi } from '../../../../../api/endpoints/groups';
import { roomsApi } from '../../../../../api/endpoints/rooms';
import { studentsApi } from '../../../../../api/endpoints/students';
import { EventInput } from '@fullcalendar/core';


import type { Class as ClassItem } from '../../../../../api/endpoints/classes';
import { HHmmToMinutes } from '@/utils/HHmmToMinutes';

/** Same calendar day in local time — not the same 24 hours. */
const isSameLocalDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

export function useClassEventsWithNames(classes: ClassItem[]): EventInput[] {
  const theme = useTheme();
  const { data: groups = [] } = useQuery({
    queryKey: ['groups'],
    queryFn: groupsApi.getGroups,
  });
  const { data: rooms = [] } = useQuery({
    queryKey: ['rooms'],
    queryFn: roomsApi.getRooms,
  });
  const { data: students = [] } = useQuery({
    queryKey: ['students'],
    queryFn: studentsApi.getStudents,
  });

  // Date.now() is impure and can't be called during render — read it from
  // state instead, refreshed periodically so a class fades out on its own if
  // the calendar tab is left open past its end time.
  const [now, setNow] = React.useState<number | null>(null);
  React.useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);

  const groupNameMap = React.useMemo(() => {
    const map: Record<number, { name: string; color?: string }> = {};
    groups.forEach(g => {
      if (g.id && g.name) map[g.id] = { name: g.name, color: g.colorHex };
    });
    return map;
  }, [groups]);

  const roomNameMap = React.useMemo(() => {
    const map: Record<number, string> = {};
    rooms.forEach(r => {
      if (r.id && r.name) map[r.id] = r.name;
    });
    return map;
  }, [rooms]);

  const studentNameMap = React.useMemo(() => {
    const map: Record<number, string> = {};
    students.forEach(s => {
      if (s.id && s.name) map[s.id] = s.name;
    });
    return map;
  }, [students]);

  return classes.map((c) => {
    const start = c.startTime.includes('T') ? new Date(c.startTime) : new Date(`${c.startTime}T00:00:00`);
    const end = new Date(start.getTime() + (c.lessonLength ? HHmmToMinutes(c.lessonLength) : 0) * 60000);
    const groupInfo = c.groupId ? groupNameMap[c.groupId] : undefined;
    const color = groupInfo?.color || theme.palette.primary.main;
    const groupName = groupInfo?.name || (c.groupId ? `Grupa ${c.groupId}` : '-');
    const roomName = c.roomId ? roomNameMap[c.roomId] || `Sala ${c.roomId}` : '-';
    const attendeeNames = (c.attendedStudentsIds ?? []).map(id => studentNameMap[id]).filter(Boolean);
    // Fully elapsed classes fade out (see styles.tsx `.fc-event-past`) so the
    // eye lands on what's upcoming instead of scanning past the whole week.
    const isPast = now !== null && end.getTime() < now;
    // The grids light up the whole of today's column on their own, but the
    // agenda has no column to light — so today's rows are marked here and
    // tinted in styles.tsx, giving the phone the same "today" cue.
    const isToday = now !== null && isSameLocalDay(start, new Date(now));
    const classNames = [
      ...(isPast ? ['fc-event-past'] : []),
      ...(isToday ? ['krusant-event-today'] : []),
    ];
    return {
      id: c.id.toString(),
      title: `${groupName} • ${roomName}`,
      start,
      end,
      backgroundColor: color,
      classNames,
      extendedProps: { attendeeNames },
    };
  });
}
