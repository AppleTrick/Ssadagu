import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/client';
import { ENDPOINTS } from '@/shared/api/endpoints';

export interface MyAccount {
  id: number;
  accountNumber: string;
  bankName: string;
  bankCode: string;
  verifiedStatus: string;
}

/**
 * 내 계좌 정보를 가져오는 훅 (userId 기반)
 */
export const useMyAccount = (userId: number | undefined, accessToken: string | null) => {
  return useQuery<MyAccount>({
    queryKey: ['myAccount', userId, accessToken],
    queryFn: async () => {
      if (!userId) throw new Error('유저 ID가 필요합니다.');
      const res = await apiClient.get(ENDPOINTS.ACCOUNTS.MY(userId), accessToken ?? undefined);
      if (!res.ok) throw new Error('계좌 정보를 불러오지 못했습니다.');
      const json = await res.json() as any;
      return (json.data || json) as MyAccount;
    },
    enabled: !!userId && !!accessToken,
  });
};

/**
 * SSAFY 금융망의 계좌 상세 정보(잔액 등)를 가져오는 훅
 */
export const useAccountDetail = (accountNo: string | undefined, accessToken: string | null) => {
  return useQuery<any>({
    queryKey: ['accountDetail', accountNo, accessToken],
    queryFn: async () => {
      if (!accountNo) return null;
      const res = await apiClient.get(ENDPOINTS.DEMAND_DEPOSITS.GET_ACCOUNT(accountNo), accessToken ?? undefined);
      if (!res.ok) throw new Error('금융망 계좌 정보를 불러오지 못했습니다.');
      const json = await res.json() as any;
      return json.data?.REC || json.data || json;
    },
    enabled: !!accountNo && !!accessToken,
  });
};
