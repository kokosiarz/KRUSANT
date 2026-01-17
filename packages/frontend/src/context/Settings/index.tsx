import React, { createContext, useContext } from 'react';
import { settingsApi, Settings } from '../../api/endpoints/settings';
import { useQuery } from '@tanstack/react-query';

interface SettingsContextValue {
  settings: Settings | null;
  currency: string;
  institutionName: string;
  reload: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextValue>({
  settings: null,
  currency: 'PLN',
  institutionName: '',
  reload: async () => {},
});

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: settings = null, refetch } = useQuery<Settings, Error>({
    queryKey: ['settings'],
    queryFn: settingsApi.getSettings,
    staleTime: 5 * 60 * 1000,
  });

  const currency = settings?.currency ?? 'PLN';
  const institutionName = settings?.institutionName ?? '';

  const reload = async () => { await refetch(); };
  return (
    <SettingsContext.Provider value={{ settings, currency, institutionName, reload }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
