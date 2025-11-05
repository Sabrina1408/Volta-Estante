import { useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = 'http://localhost:5000';

export const useApi = () => {
  const { getToken } = useAuth();

  const authFetch = useCallback(async (endpoint, opts = {}) => {

        const token = await getToken(false);
        if (!token) {
          const err = new Error('NOT_AUTHENTICATED');
          err.code = 'NOT_AUTHENTICATED';
          throw err;
        }
        const headers = { ...(opts.headers || {}), Authorization: `Bearer ${token}` };
        let res = await fetch(`${API_BASE_URL}${endpoint}`, { ...opts, headers });

        if (res.status === 401 || res.status === 403) {

          const freshToken = await getToken(true);
          if (!freshToken) {
            const err = new Error('NOT_AUTHENTICATED');
            err.code = 'NOT_AUTHENTICATED';
            throw err;
          }
          const freshHeaders = { ...(opts.headers || {}), Authorization: `Bearer ${freshToken}` };
          res = await fetch(`${API_BASE_URL}${endpoint}`, { ...opts, headers: freshHeaders });
        }
        return res;
    }, [getToken]);
  return { authFetch };
};