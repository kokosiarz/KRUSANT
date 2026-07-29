import React from 'react';
import SimpleCrudPage from '@/Components/Common/SimpleCrudPage';
import { roomsApi } from '@/api/endpoints/rooms';
import { Room } from '@/api/types/room';

const Rooms: React.FC = () => (
  <SimpleCrudPage<Room>
    title="Sale"
    queryKey="rooms"
    entityLabelAccusative="salę"
    getItemName={(r) => r.name || `#${r.id}`}
    fields={[
      { key: 'name', label: 'Nazwa', type: 'text', required: true },
      { key: 'capacity', label: 'Pojemność (liczba osób)', type: 'number', min: 0 },
    ]}
    api={{
      getAll: roomsApi.getRooms,
      create: (data) => roomsApi.createRoom(data as any),
      update: (id, data) => roomsApi.updateRoom(id, data),
      remove: roomsApi.deleteRoom,
    }}
  />
);

export default Rooms;
