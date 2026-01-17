import React from 'react';
import { useTheme } from '@mui/material/styles';
import { useQuery } from '@tanstack/react-query';
import { groupsApi } from '../../../../api/endpoints/groups';
import { roomsApi } from '../../../../api/endpoints/rooms';
import { EventInput } from '@fullcalendar/core';


import type { Class as ClassItem } from '../../../../api/endpoints/classes';
import { HHmmToMinutes } from '@/utils/HHmmToMinutes';

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

  return classes.map((c) => {
    const start = c.startTime.includes('T') ? new Date(c.startTime) : new Date(`${c.startTime}T00:00:00`);
    const end = new Date(start.getTime() + (c.lessonLength ? HHmmToMinutes(c.lessonLength) : 0) * 60000);
    const groupInfo = c.groupId ? groupNameMap[c.groupId] : undefined;
    const color = groupInfo?.color || theme.palette.primary.main;
    const groupName = groupInfo?.name || (c.groupId ? `Grupa ${c.groupId}` : '-');
    const roomName = c.roomId ? roomNameMap[c.roomId] || `Sala ${c.roomId}` : '-';
    return {
      id: c.id.toString(),
      title: `${groupName} • ${roomName}`,
      start,
      end,
      backgroundColor: color,
    };
  });
}
