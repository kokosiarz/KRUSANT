import api from '../client';
import { Room } from '../types/room';

export interface CreateRoomRequest {
  name: string;
  capacity?: number;
}

export type UpdateRoomRequest = Partial<CreateRoomRequest>;

export const roomsApi = {
  getRooms: async (): Promise<Room[]> => {
    return api.get<Room[]>('/rooms');
  },
  getRoomById: async (id: number): Promise<Room> => {
    return api.get<Room>(`/rooms/${id}`);
  },
  createRoom: async (data: CreateRoomRequest): Promise<Room> => {
    return api.post<Room>('/rooms', data);
  },
  updateRoom: async (id: number, data: UpdateRoomRequest): Promise<Room> => {
    return api.patch<Room>(`/rooms/${id}`, data);
  },
  deleteRoom: async (id: number): Promise<void> => {
    return api.delete<void>(`/rooms/${id}`);
  },
};
