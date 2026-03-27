'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import styled from '@emotion/styled';
import { HeaderBack } from '@/widgets/header';
import { Button, Input } from '@/shared/ui';
import { useAuthStore } from '@/shared/auth/useAuthStore';
import { apiClient } from '@/shared/api/client';
import { useMyProfile, updateUser } from '@/entities/user';
import { getProxyImageUrl, compressImage } from '@/shared/utils/image';
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
  overflow: hidden;
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
  z-index: 10;
`;

const RemoveImageButton = styled.button`
  position: absolute;
  top: 0;
  right: 0;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  cursor: pointer;
  z-index: 10;
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
  const { accessToken, userId } = useAuthStore();

  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isImageDeleted, setIsImageDeleted] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // 프로필 조회 (entities에 정의된 공통 훅 사용 - region -> regionName 매핑 포함)
  const { data: user } = useMyProfile();

  useEffect(() => {
    if (user) {
      if (user.nickname) setNickname(user.nickname);
      // 로컬에서 선택한 이미지가 없을 때만 서버 이미지를 반영
      if (!selectedImageFile && !isImageDeleted) {
        setPreviewUrl(user.profileImageUrl || null);
      }
    }
  }, [user, selectedImageFile, isImageDeleted]);

  // Preview URL Cleanup
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // 프로필 수정 Mutation
  const mutation = useMutation({
    mutationFn: (data: { nickname?: string }) => {
      if (!userId) throw new Error('사용자 정보가 없습니다.');
      return updateUser(userId, data, accessToken ?? undefined);
    },
    onSuccess: () => {
      setIsUploading(false);
      queryClient.invalidateQueries({ queryKey: ['myProfile', userId] });
      setToastVisible(true);
      setTimeout(() => {
        setToastVisible(false);
        router.push('/my');
      }, 1500);
    },
    onError: (err: Error) => {
      setIsUploading(false);
      setError(err.message || '저장에 실패했습니다.');
    },
  });


  const handleSave = async () => {
    if (!nickname.trim()) {
      setError("닉네임을 입력해주세요.");
      return;
    }
    if (nickname.length < 2 || nickname.length > 20) {
      setError("닉네임은 2~20자 사이여야 합니다.");
      return;
    }

    setError("");
    setIsUploading(true);

    const timeoutMillis = 10000;
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('TIMEOUT_ERROR')), timeoutMillis)
    );

    try {
      let updatedUser: User | null = null;

      // 1) 이미지 처리: 새 이미지 업로드
      if (selectedImageFile) {
        // 이미지 압축 (1MB 제한)
        const compressed = await compressImage(selectedImageFile, 1920, 1920, 1);
        
        if (compressed.size > 1.1 * 1024 * 1024) {
          throw new Error("이미지 파일 용량이 너무 큽니다. 1MB 이하의 파일을 선택해주세요.");
        }

        const formData = new FormData();
        formData.append("file", compressed);

        const uploadRes = await Promise.race([
          apiClient.postMultipart(
            `/users/${userId}/profile-image`,
            formData,
            accessToken ?? undefined
          ),
          timeoutPromise
        ]);

        if (uploadRes instanceof Response && !uploadRes.ok)
          throw new Error("프로필 이미지 업로드에 실패했습니다.");
        
        const resBody = uploadRes instanceof Response ? await uploadRes.json() : {};
        const rawUser = resBody.data || resBody;
        // Mapping fix
        if (rawUser && rawUser.region && !rawUser.regionName) {
          rawUser.regionName = rawUser.region;
        }
        updatedUser = rawUser;
      }

      // 2) 이미지 처리: 삭제 요청
      if (isImageDeleted && !selectedImageFile) {
        const deleteRes = await Promise.race([
          apiClient.delete(
            `/users/${userId}/profile-image`,
            accessToken ?? undefined
          ),
          timeoutPromise
        ]);
        if (deleteRes instanceof Response && !deleteRes.ok)
          throw new Error("프로필 이미지 삭제에 실패했습니다.");
        
        const resBody = deleteRes instanceof Response ? await deleteRes.json() : {};
        const rawUser = resBody.data || resBody;
        // Mapping fix
        if (rawUser && rawUser.region && !rawUser.regionName) {
          rawUser.regionName = rawUser.region;
        }
        updatedUser = rawUser;
      }

      // 수동 캐시 갱신
      if (updatedUser) {
        queryClient.setQueryData(["myProfile", userId], updatedUser);
      }

      // 3) 닉네임 변경
      if (user?.nickname !== nickname) {
        const patchRes = await Promise.race([
          mutation.mutateAsync({ nickname }),
          timeoutPromise
        ]);
        if (patchRes && typeof patchRes === 'object') {
          queryClient.setQueryData(["myProfile", userId], patchRes);
        }
      } else {
        setIsUploading(false);
        queryClient.invalidateQueries({ queryKey: ["myProfile", userId] });
        setToastVisible(true);
        setTimeout(() => {
          setToastVisible(false);
          router.push("/my");
        }, 1500);
      }
    } catch (err: any) {
      setIsUploading(false);
      if (err.message === 'TIMEOUT_ERROR') {
        setError("요청 시간이 초과되었습니다. 다시 시도해주세요.");
      } else {
        setError(err.message || "저장에 실패했습니다.");
      }
    }
  };

  return (
    <Page>
      <HeaderBack title="프로필 수정" onBack={() => router.back()} />

      <ToastWrapper visible={toastVisible}>저장되었습니다</ToastWrapper>

      <ContentArea>
        <Section>
          <AvatarWrapper>
            <Avatar>
              {previewUrl && previewUrl.trim() !== "" ? (
                <img
                  src={getProxyImageUrl(previewUrl)}
                  alt="프로필 이미지 미리보기"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <UserIcon />
              )}
            </Avatar>

            <AvatarEditButton type="button" aria-label="프로필 사진 변경" onClick={() => fileInputRef.current?.click()}>
              <CameraIcon />
            </AvatarEditButton>
            {previewUrl && (
              <RemoveImageButton
                type="button"
                aria-label="프로필 사진 삭제"
                onClick={() => {
                  setPreviewUrl(null);
                  setSelectedImageFile(null);
                  setIsImageDeleted(true);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
              >
                ✕
              </RemoveImageButton>
            )}
            <input
              type="file"
              accept="image/*"
              hidden
              ref={fileInputRef}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setSelectedImageFile(file);
                  setPreviewUrl(URL.createObjectURL(file));
                  setIsImageDeleted(false);
                }
              }}
            />
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
            loading={mutation.isPending || isUploading}
            onClick={handleSave}
            disabled={mutation.isPending || isUploading}
          >
            저장하기
          </Button>
        </BottomBar>
      </ContentArea>
    </Page>
  );
}
