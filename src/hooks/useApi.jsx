import { useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = 'http://localhost:5000';

export const useApi = () => {
  const { getToken } = useAuth();

  const authFetch = useCallback(async (endpoint, opts = {}) => {
      const token = await getToken();
      const headers = { ...(opts.headers || {}), Authorization: `Bearer ${token}` };
      return fetch(`${API_BASE_URL}${endpoint}`, { ...opts, headers });
    }, [getToken]);
  return { authFetch };
};