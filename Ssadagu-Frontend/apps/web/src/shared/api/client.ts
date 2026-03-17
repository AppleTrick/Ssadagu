import { useAuthStore } from '../auth/useAuthStore';
import { ENDPOINTS } from './endpoints';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080/api/v1';

const handleRequest = async (url: string, options: RequestInit, originalToken?: string): Promise<Response> => {
  const finalOptions: RequestInit = {
    ...options,
    credentials: 'include',
  };
  let response = await fetch(`${BASE_URL}${url}`, finalOptions);
  
  if (response.status === 401 && url !== ENDPOINTS.AUTH.REISSUE) {
    const state = useAuthStore.getState();
    const currentAccessToken = originalToken || state.accessToken;
    
    if (currentAccessToken) {
      try {
        const reissueOptions: RequestInit = {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${currentAccessToken}`,
          },
        };
        const reissueRes = await fetch(`${BASE_URL}${ENDPOINTS.AUTH.REISSUE}`, reissueOptions);
        
        if (reissueRes.ok) {
          const body = await reissueRes.json() as Record<string, any>;
          const tokenData = body.data || body;
          const newAccessToken = tokenData.accessToken;
          
          if (newAccessToken) {
            state.setToken(newAccessToken);
            // retry original request
            const newOptions = { ...finalOptions };
            if (newOptions.headers) {
              const headers = new Headers(newOptions.headers);
              headers.set('Authorization', `Bearer ${newAccessToken}`);
              newOptions.headers = headers;
            }
            response = await fetch(`${BASE_URL}${url}`, newOptions);
          } else {
            state.clearToken();
            if (typeof window !== 'undefined' && url !== ENDPOINTS.USERS.ME) window.location.href = '/login';
          }
        } else {
          state.clearToken();
        }
      } catch (err) {
        state.clearToken();
      }
    } else {
      state.clearToken();
    }
  }
  return response;
};

export const apiClient = {
  get: (url: string, token?: string) =>
    handleRequest(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }, token),
  post: (url: string, body: unknown, token?: string) =>
    handleRequest(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    }, token),
  put: (url: string, body: unknown, token?: string) =>
    handleRequest(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    }, token),
  delete: (url: string, token?: string) =>
    handleRequest(url, {
      method: 'DELETE',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }, token),
  patch: (url: string, body?: unknown, token?: string) =>
    handleRequest(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    }, token),
};
