import { apiClient } from '@/shared/api/client';
import { ENDPOINTS } from '@/shared/api/endpoints';
import { useAuthStore } from '@/shared/auth/useAuthStore';

export const useVerifyAccount = () => {
  const accessToken = useAuthStore((s) => s.accessToken);

  const sendCode = async (accountId: number): Promise<void> => {
    const res = await apiClient.post(
      ENDPOINTS.ACCOUNTS.VERIFY_SEND(accountId),
      {},
      accessToken ?? undefined,
    );
    if (!res.ok) {
      const body = await res.json().catch(() => ({})) as Record<string, unknown>;
      throw new Error(typeof body.message === 'string' ? body.message : '1원 송금 요청에 실패했습니다.');
    }
  };

  const confirmCode = async (accountId: number, code: string): Promise<void> => {
    const res = await apiClient.post(
      ENDPOINTS.ACCOUNTS.VERIFY_CONFIRM(accountId),
      { code },
      accessToken ?? undefined,
    );
    if (!res.ok) {
      const body = await res.json().catch(() => ({})) as Record<string, unknown>;
      throw new Error(typeof body.message === 'string' ? body.message : '인증에 실패했습니다.');
    }
  };

  return { sendCode, confirmCode };
};
