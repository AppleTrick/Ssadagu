import { useState } from 'react';
import { apiClient } from '@/shared/api/client';
import { ENDPOINTS } from '@/shared/api/endpoints';
import { useAuthStore } from '@/shared/auth/useAuthStore';

export const useLoginForm = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (email: string, password: string): Promise<boolean> => {
    setError(null);
    setLoading(true);
    try {
      const res = await apiClient.post(ENDPOINTS.AUTH.LOGIN, { email, password });
      if (!res.ok) {
        const body = await res.json().catch(() => ({})) as Record<string, unknown>;
        setError(typeof body.message === 'string' ? body.message : '로그인에 실패했습니다.');
        return false;
      }

      const body = await res.json() as any;
      const data = body.data || body;
      const token = data.accessToken;
      const userId = data.userId;

      if (token && userId) {
        useAuthStore.getState().setAuthInfo(token, userId);
      }
      return true;
    } catch {
      setError('네트워크 오류가 발생했습니다.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { login, loading, error };
};
