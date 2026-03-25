import { useState } from 'react';
import { apiClient } from '@/shared/api/client';
import { ENDPOINTS } from '@/shared/api/endpoints';
import { useAuthStore } from '@/shared/auth/useAuthStore';
import { useModalStore } from '@/shared/hooks/useModalStore';

interface SignupParams {
  email: string;
  password: string;
  nickname: string;
}

export const useSignupForm = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { alert: modalAlert } = useModalStore();

  const signup = async (params: SignupParams): Promise<boolean> => {
    setError(null);
    setLoading(true);
    try {
      const res = await apiClient.post(ENDPOINTS.USERS.SIGNUP, params);
      if (!res.ok) {
        const body = await res.json().catch(() => ({})) as Record<string, unknown>;
        const message = typeof body.message === 'string' ? body.message : '회원가입에 실패했습니다.';
        setError(message);
        modalAlert({ message, variant: 'danger' });
        return false;
      }

      // 회원가입 성공 시 별도의 토큰 발급 및 자동 로그인을 수행하지 않습니다.
      // 사용자는 로그인 후 서비스를 이용해야 합니다.

      return true;
    } catch {
      const message = '네트워크 오류가 발생했습니다.';
      setError(message);
      modalAlert({ message, variant: 'danger' });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { signup, loading, error };
};
