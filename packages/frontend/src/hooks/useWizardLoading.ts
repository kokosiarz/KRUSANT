import { useState } from 'react';

export const useWizardLoading = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  return { loading, setLoading, error, setError, clearError };
};
