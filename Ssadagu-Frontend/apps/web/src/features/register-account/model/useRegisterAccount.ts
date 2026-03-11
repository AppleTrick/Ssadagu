import { apiClient } from '@/shared/api/client';
import { ENDPOINTS } from '@/shared/api/endpoints';
import { useAuthStore } from '@/shared/auth/useAuthStore';

interface RegisterParams {
  bankCode: string;
  accountNumber: string;
  accountHolderName: string;
}

export const useRegisterAccount = () => {
  const accessToken = useAuthStore((s) => s.accessToken);

  const register = async (params: RegisterParams): Promise<number> => {
    const res = await apiClient.post(
      ENDPOINTS.ACCOUNTS.BASE,
      params,
      accessToken ?? undefined,
    );
    if (!res.ok) {
      const body = await res.json().catch(() => ({})) as Record<string, unknown>;
      throw new Error(typeof body.message === 'string' ? body.message : '계좌 등록에 실패했습니다.');
    }
    const body = await res.json() as Record<string, unknown>;
    const nested = body.data as Record<string, unknown> | undefined;
    const id = typeof body.id === 'number' ? body.id
      : typeof nested?.id === 'number' ? nested.id as number
      : null;
    if (!id) throw new Error('계좌 ID를 받지 못했습니다.');
    return id;
  };

  return { register };
};
