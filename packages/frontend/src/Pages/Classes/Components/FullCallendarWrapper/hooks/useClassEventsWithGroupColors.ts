import React from 'react';
import { useTheme } from '@mui/material/styles';
import { useQuery } from '@tanstack/react-query';
import { groupsApi } from '../../../../../api/endpoints/groups';
import { EventInput } from '@fullcalendar/core';

type ClassItem = {
  id?: number;
  startTime: string;
  duration: number;
  roomId?: number;
  groupId?: number;
};

export function useClassEventsWithGroupColors(classes: ClassItem[]): EventInput[] {
  const theme = useTheme();
  const { data: groups = [] } = useQuery({
    queryKey: ['groups'],
    queryFn: groupsApi.getGroups,
  });

  const groupColorMap = React.useMemo(() => {
    const map: Record<number, string> = {};
    groups.forEach(g => {
      if (g.id && g.colorHex) map[g.id] = g.colorHex;
    });
    return map;
  }, [groups]);

  return classes.map((c) => {
    const start = c.startTime.includes('T') ? new Date(c.startTime) : new Date(`${c.startTime}T00:00:00`);
    const end = new Date(start.getTime() + (c.duration ?? 0) * 60000);
    const color = c.groupId ? groupColorMap[c.groupId] : theme.palette.primary.main;
    console.log(theme.palette.primary.main);
    return {
      id: c.id ? String(c.id) : `${c.groupId ?? 'g'}-${c.startTime}`,
      title: `Grupa ${c.groupId ?? '-'} • Sala ${c.roomId ?? '-'}`,
      start,
      end,
      backgroundColor: color,
    };
  });
}
