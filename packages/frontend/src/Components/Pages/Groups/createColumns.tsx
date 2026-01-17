import React from 'react';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import { Group } from './types';

import type { Teacher } from '@/api/endpoints/teachers';
import type { Room } from '@/api/types/room';
import type { Student } from '@/Components/Pages/Students/types';

export function createColumns(
  handleEditGroup: (groupId: number) => void,
  currency: string,
  teachers: Teacher[],
  rooms: Room[],
  students: Student[]
) {
  const getTeacherName = (id?: number) => {
    const t = teachers.find(t => t.id === id);
    if (!t) return '-';
    if (t.firstName || t.lastName) return `${t.firstName ?? ''} ${t.lastName ?? ''}`.trim();
    return t.name || '-';
  };
  const getRoomName = (id?: number) => {
    const r = rooms.find(r => r.id === id);
    return r ? r.name : '-';
  };
  return [
    // { id: 'id', label: 'ID', render: (group: Group) => group.id },
    { id: 'name', label: 'Nazwa', render: (group: Group) => (
      <span style={{ display: 'flex', alignItems: 'center' }}>
        {group.colorHex && (
          <span style={{
            display: 'inline-block',
            width: 12,
            height: 12,
            borderRadius: '50%',
            background: group.colorHex,
            marginRight: 8,
          }} />
        )}
        {group.name}
      </span>
    ) },
    // { id: 'isActive', label: 'Aktywna', render: (group: Group) => group.isActive ? 'Tak' : 'Nie' },
    { id: 'studentIds', label: 'Kursanci', render: (group: Group) => {
      if (Array.isArray(group.studentIds) && group.studentIds.length > 0) {
        const names = group.studentIds
          .map(id => {
            const student = students.find(s => s.id === id);
            return student ? student.name : null;
          })
          .filter(Boolean);
        return names.length > 0 ? names.join(', ') : group.studentIds.length;
      }
      return 0;
    } },
    { id: 'classIds', label: 'Zajęcia', render: (group: Group) => group.classIds?.length ?? 0 },
    { id: 'cost', label: 'Koszt', render: (group: Group) => `${group.cost?.toFixed?.(2) ?? '-'} ${currency}` },
    { id: 'unitCost', label: 'Koszt jednostkowy (h)', render: (group: Group) => `${group.unitCost?.toFixed?.(2) ?? '-'} ${currency}` },
    { id: 'teacherId', label: 'Nauczyciel', render: (group: Group) => getTeacherName(group.teacherId) },
    { id: 'roomId', label: 'Sala', render: (group: Group) => getRoomName(group.roomId) },
    { id: 'minStartDate', label: 'Min. data startu', render: (group: Group) => group.minStartDate ? `${group.minStartDate.day}.${group.minStartDate.month}${group.minStartDate.year ? '.' + group.minStartDate.year : ''}` : '-' },
    { id: 'maxEndDate', label: 'Max. data końca', render: (group: Group) => group.maxEndDate ? `${group.maxEndDate.day}.${group.maxEndDate.month}${group.maxEndDate.year ? '.' + group.maxEndDate.year : ''}` : '-' },
    // removed colorHex column
    // { id: 'baseTemplateName', label: 'Szablon', render: (group: Group) => group.baseTemplateName ?? '-' },
    // { id: 'courseId', label: 'Kurs', render: (group: Group) => group.courseId ?? '-' },
    { id: 'startHour', label: 'Godzina', render: (group: Group) => group.startHour ?? '-' },
    { id: 'lessonLength', label: 'Długość lekcji', render: (group: Group) => group.lessonLength ?? '-' },
    { id: 'comment', label: 'Komentarz', render: (group: Group) => group.comment },
    {
      id: 'actions',
      label: 'Akcje',
      render: (group: Group) => (
        <IconButton size="small" onClick={() => handleEditGroup(group.id)} color="primary">
          <EditIcon fontSize="small" />
        </IconButton>
      ),
    },
  ];
}
