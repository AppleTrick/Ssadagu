import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/client';
import { ENDPOINTS } from '@/shared/api/endpoints';

/**
 * 수시입출금 계좌에 금액을 입금(테스트)하는 훅
 */
export const useDeposit = (accessToken: string | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ accountNo, amount, summary }: { accountNo: string; amount: number; summary: string }) => {
      const res = await apiClient.post(
        ENDPOINTS.DEMAND_DEPOSITS.DEPOSIT(accountNo),
        { amount, summary },
        accessToken ?? undefined
      );
      if (!res.ok) throw new Error('입금에 실패했습니다.');
      return await res.json();
    },
    onSuccess: (_, variables) => {
        // 성공 시 계좌 상세 정보 갱신
        queryClient.invalidateQueries({ queryKey: ['accountDetail', variables.accountNo] });
    }
  });
};
