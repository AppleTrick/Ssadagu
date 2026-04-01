'use client';

import { ConfirmDialog } from '@/shared/ui';
import { apiClient } from '@/shared/api/client';
import { ENDPOINTS } from '@/shared/api/endpoints';
import { useAuthStore } from '@/shared/auth/useAuthStore';

interface WithdrawModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

const WithdrawModal = ({ isOpen, onConfirm, onClose }: WithdrawModalProps) => {
  const { accessToken, userId, clearToken } = useAuthStore();

  const handleConfirm = async () => {
    try {
      if (!userId) return;
      await apiClient.delete(ENDPOINTS.USERS.PROFILE(userId), accessToken ?? undefined);
    } catch {
      // 서버 오류와 무관하게 로컬 토큰 삭제
    } finally {
      clearToken();
      onConfirm();
    }
  };

  return (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      title="탈퇴하기"
      message={'탈퇴하면 모든 정보가 삭제됩니다.\n정말 탈퇴하시겠습니까?'}
      confirmLabel="탈퇴"
      cancelLabel="취소"
      onConfirm={handleConfirm}
      variant="danger"
    />
  );
};

export default WithdrawModal;
