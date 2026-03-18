'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import styled from '@emotion/styled';
import { HeaderBack } from '@/widgets/header';
import { Button, Input } from '@/shared/ui';
import { useAuthStore } from '@/shared/auth/useAuthStore';
import { getUserMe, updateUser } from '@/entities/user';
import type { User } from '@/entities/user';
import {
  colors,
  typography,
  radius,
  HEADER_HEIGHT,
} from '@/shared/styles/theme';

/* ── Styled ─────────────────────────────────────────────── */

const Page = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
  background: ${colors.surface};
`;

const ContentArea = styled.main`
  flex: 1;
  padding-top: ${HEADER_HEIGHT}px;
  padding-bottom: 40px;
  display: flex;
  flex-direction: column;
`;

const Section = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32px;
  padding: 32px 24px;
`;

const AvatarWrapper = styled.div`
  position: relative;
`;

const Avatar = styled.div`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: ${colors.bg};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const AvatarEditButton = styled.button`
  position: absolute;
  bottom: 0;
  right: 0;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${colors.primary};
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
`;

const FormSection = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const FieldLabel = styled.label`
  font-family: ${typography.fontFamily};
  font-size: ${typography.size.sm};
  font-weight: ${typography.weight.medium};
  color: ${colors.textPrimary};
`;

const ToastWrapper = styled.div<{ visible: boolean }>`
  position: fixed;
  top: ${HEADER_HEIGHT + 12}px;
  left: 50%;
  transform: translateX(-50%);
  background: ${colors.textPrimary};
  color: ${colors.surface};
  font-family: ${typography.fontFamily};
  font-size: ${typography.size.sm};
  padding: 10px 20px;
  border-radius: ${radius.pill};
  white-space: nowrap;
  opacity: ${({ visible }) => (visible ? 1 : 0)};
  transition: opacity 0.3s;
  pointer-events: none;
  z-index: 100;
`;

const ErrorMsg = styled.p`
  font-family: ${typography.fontFamily};
  font-size: ${typography.size.sm};
  color: ${colors.red};
  margin: 0;
  text-align: center;
`;

const BottomBar = styled.div`
  padding: 16px 24px 40px;
`;

const UserIcon = () => (
  <svg width="44" height="44" viewBox="0 0 24 24" fill={colors.textSecondary} aria-hidden="true">
    <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
  </svg>
);

const CameraIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="white" aria-hidden="true">
    <path d="M12 15.2c1.77 0 3.2-1.43 3.2-3.2S13.77 8.8 12 8.8 8.8 10.23 8.8 12s1.43 3.2 3.2 3.2zM9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z" />
  </svg>
);

/* ── Component ───────────────────────────────────────────── */

export function ProfileEditPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const accessToken = useAuthStore((s) => s.accessToken);

  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  // 프로필 조회
  const { data: user } = useQuery<User>({
    queryKey: ['myProfile'],
    queryFn: () => getUserMe(accessToken ?? undefined),
    enabled: !!accessToken,
  });

  useEffect(() => {
    if (user?.nickname) setNickname(user.nickname);
  }, [user]);

  // 프로필 수정 Mutation
  const mutation = useMutation({
    mutationFn: (data: { nickname: string }) => updateUser(data, accessToken ?? undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myProfile'] });
      setToastVisible(true);
      setTimeout(() => {
        setToastVisible(false);
        router.push('/my');
      }, 1500);
    },
    onError: (err: Error) => {
      setError(err.message || '저장에 실패했습니다.');
    },
  });

  const handleSave = () => {
    if (!nickname.trim()) {
      setError('닉네임을 입력해주세요.');
      return;
    }
    if (nickname.length < 2 || nickname.length > 20) {
      setError('닉네임은 2~20자 사이여야 합니다.');
      return;
    }

    setError('');
    mutation.mutate({ nickname });
  };

  return (
    <Page>
      <HeaderBack title="프로필 수정" onBack={() => router.back()} />

      <ToastWrapper visible={toastVisible}>저장되었습니다</ToastWrapper>

      <ContentArea>
        <Section>
          <AvatarWrapper>
            <Avatar><UserIcon /></Avatar>
            <AvatarEditButton type="button" aria-label="프로필 사진 변경">
              <CameraIcon />
            </AvatarEditButton>
          </AvatarWrapper>

          <FormSection>
            <FieldGroup>
              <FieldLabel htmlFor="edit-nickname">닉네임</FieldLabel>
              <Input
                id="edit-nickname"
                placeholder="닉네임을 입력하세요 (2~20자)"
                value={nickname}
                onChange={(e) => {
                  setNickname(e.target.value);
                  setError('');
                }}
                maxLength={20}
              />
            </FieldGroup>
            <FieldGroup>
              <FieldLabel>이메일</FieldLabel>
              <Input
                value={user?.email ?? ''}
                disabled
                placeholder="이메일"
              />
            </FieldGroup>
            {error && <ErrorMsg role="alert">{error}</ErrorMsg>}
          </FormSection>
        </Section>

        <BottomBar>
          <Button
            variant="primary"
            size="lg"
            fullWidth
            loading={mutation.isPending}
            onClick={handleSave}
          >
            저장하기
          </Button>
        </BottomBar>
      </ContentArea>
    </Page>
  );
}
