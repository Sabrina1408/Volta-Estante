import { useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

export const useApi = () => {
  const { getToken } = useAuth();

  // Usamos useCallback para memorizar a função authFetch.
  // Ela só será recriada se a função `getToken` mudar, o que a torna estável entre renderizações.
  const authFetch = useCallback(async (url, opts = {}) => {
      const token = await getToken();
      const headers = { ...(opts.headers || {}), Authorization: `Bearer ${token}` };
      return fetch(url, { ...opts, headers });
    }, [getToken]);
  return { authFetch };
};