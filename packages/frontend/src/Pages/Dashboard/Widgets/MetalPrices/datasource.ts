import { useQuery } from '@tanstack/react-query';

// Relative by default so nginx proxies it in production; override with
// VITE_METAL_API_URL in .env.local if you need to point dev at a real
// backend for this widget specifically.
const BASE_URL = import.meta.env.VITE_METAL_API_URL || '/metal-price-api';

export interface MetalPriceResponse {
  date: string;
  price: number;
}

export const fetchMetalPrices = async ({ metal }: { metal: 'gold' | 'silver' }): Promise<MetalPriceResponse> => {
  const response = await fetch(`${BASE_URL}/${metal}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch ${metal} prices: ${response.statusText}`);
  }
  
  const data = await response.json();
  // API returns array like: [{"date":"2026-02-13","price":9.49}]
  return data[0];
};

export const useMetalPrices = (metal: 'gold' | 'silver') => {
  return useQuery({
    queryKey: ['metalPrices', metal],
    queryFn: () => fetchMetalPrices({ metal }),
    staleTime: 1000 * 60 * 60, // 1 hour
    refetchInterval: 1000 * 60 * 60, // Refetch every 1 hour
  });
};