import api from '../client';
import { Room } from '../types/room';

export const roomsApi = {
  getRooms: async (): Promise<Room[]> => {
    return api.get<Room[]>('/rooms');
  },
  getRoomById: async (id: number): Promise<Room> => {
    return api.get<Room>(`/rooms/${id}`);
  },
};
