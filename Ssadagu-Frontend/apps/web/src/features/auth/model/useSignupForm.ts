import { useState } from 'react';
import { apiClient } from '@/shared/api/client';
import { ENDPOINTS } from '@/shared/api/endpoints';
import { useAuthStore } from '@/shared/auth/useAuthStore';

interface SignupParams {
  email: string;
  password: string;
  nickname: string;
}

export const useSignupForm = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signup = async (params: SignupParams): Promise<boolean> => {
    setError(null);
    setLoading(true);
    try {
      const res = await apiClient.post(ENDPOINTS.USERS.SIGNUP, params);
      if (!res.ok) {
        const body = await res.json().catch(() => ({})) as Record<string, unknown>;
        setError(typeof body.message === 'string' ? body.message : '회원가입에 실패했습니다.');
        return false;
      }

      const body = await res.json() as any;
      const data = body.data || body;
      const accessToken = data.token?.accessToken || data.token;
      const userId = data.id || data.token?.userId;

      if (accessToken && userId) {
        useAuthStore.getState().setAuthInfo(accessToken, userId);
      }

      return true;
    } catch {
      setError('네트워크 오류가 발생했습니다.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { signup, loading, error };
};
