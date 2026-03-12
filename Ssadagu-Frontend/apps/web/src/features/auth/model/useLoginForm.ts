import { useState } from 'react';
import { apiClient } from '@/shared/api/client';
import { ENDPOINTS } from '@/shared/api/endpoints';
import { useAuthStore } from '@/shared/auth/useAuthStore';

export const useLoginForm = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setToken = useAuthStore((s) => s.setToken);

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

      const body = await res.json() as Record<string, unknown>;
      const nested = body?.data as Record<string, unknown> | undefined;
      const token =
        typeof body?.accessToken === 'string'
          ? body.accessToken
          : typeof nested?.accessToken === 'string'
            ? nested.accessToken
            : '';

      if (token) setToken(token as string);
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
