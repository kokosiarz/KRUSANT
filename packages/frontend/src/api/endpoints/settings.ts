import api from '../client';

export interface Settings {
  id: number;
  institutionName: string;
  currency: string;
}

export interface UpdateSettingsRequest {
  institutionName?: string;
  currency?: string;
}

export const settingsApi = {
  getSettings: async (): Promise<Settings> => {
    return api.get<Settings>('/settings');
  },
  updateSettings: async (data: UpdateSettingsRequest): Promise<Settings> => {
    return api.put<Settings>('/settings', data);
  },
};
