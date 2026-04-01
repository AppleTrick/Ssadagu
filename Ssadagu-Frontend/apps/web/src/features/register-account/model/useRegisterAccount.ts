import { apiClient } from '@/shared/api/client';
import { ENDPOINTS } from '@/shared/api/endpoints';
import { useAuthStore } from '@/shared/auth/useAuthStore';

interface RegisterParams {
  bankCode: string;
  bankName: string;
  accountNumber: string;
  accountHolderName: string;
}

/**
 * 계좌 등록 및 1원 인증 관련 기능을 제공하는 커스텀 훅
 */
export const useRegisterAccount = () => {
  const accessToken = useAuthStore((s) => s.accessToken);

  // 1. 계좌 정보 등록 및 1원 송금 요청
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
    
    // 응답 본문에서 id 추출 로직 (다양한 응답 구조 대응)
    const id = typeof body.id === 'number' ? body.id
      : typeof nested?.id === 'number' ? (nested.id as number)
      : null;
      
    if (!id) throw new Error('계좌 ID를 받지 못했습니다.');
    return id;
  };

  // 2. 실제 1원 송금 요청 (내역 발생)
  const sendVerification = async (accountId: number): Promise<boolean> => {
    const res = await apiClient.post(
      ENDPOINTS.ACCOUNTS.VERIFY_SEND(accountId),
      {},
      accessToken ?? undefined,
    );
    if (!res.ok) {
      const body = await res.json().catch(() => ({})) as Record<string, unknown>;
      throw new Error(typeof body.message === 'string' ? body.message : '1원 송금 요청에 실패했습니다.');
    }
    return true;
  };

  // 3. 1원 송금 후 입금자명 끝 4자리 코드 확인
  const confirmCode = async (accountId: number, code: string): Promise<boolean> => {
    const res = await apiClient.post(
      ENDPOINTS.ACCOUNTS.VERIFY_CONFIRM(accountId),
      { code },
      accessToken ?? undefined,
    );
    if (!res.ok) {
      const body = await res.json().catch(() => ({})) as Record<string, unknown>;
      throw new Error(typeof body.message === 'string' ? body.message : '인증번호가 일치하지 않습니다.');
    }
    return true;
  };

  return { register, sendVerification, confirmCode };
};
