'use client';

import { useState } from 'react';
import { ConfirmDialog } from '@/shared/ui';
import { apiClient } from '@/shared/api/client';
import { ENDPOINTS } from '@/shared/api/endpoints';
import { useAuthStore } from '@/shared/auth/useAuthStore';

interface LogoutModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

const LogoutModal = ({ isOpen, onConfirm, onClose }: LogoutModalProps) => {
  const [loading, setLoading] = useState(false);
  const { accessToken, clearToken } = useAuthStore();

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await apiClient.post(ENDPOINTS.AUTH.LOGOUT, {}, accessToken ?? undefined);
    } catch {
      // 서버 오류와 무관하게 로컬 토큰 삭제
    } finally {
      clearToken();
      setLoading(false);
      onConfirm();
    }
  };

  return (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      title="로그아웃"
      message="정말 로그아웃 하시겠습니까?"
      confirmLabel={loading ? '로그아웃 중...' : '로그아웃'}
      cancelLabel="취소"
      onConfirm={handleConfirm}
    />
  );
};

export default LogoutModal;
