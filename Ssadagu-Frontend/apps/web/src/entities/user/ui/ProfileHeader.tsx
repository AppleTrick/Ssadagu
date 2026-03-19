'use client';

import styled from '@emotion/styled';
import { colors, typography } from '@/shared/styles/theme';
import { getProxyImageUrl } from '@/shared/utils/image';
import type { User } from '../model/types';

interface ProfileHeaderProps {
  user: User;
  onEditClick?: () => void;
}

const ProfileHeader = ({ user, onEditClick }: ProfileHeaderProps) => {
  return (
    <Container>
      <Avatar>
        {user.profileImageUrl && user.profileImageUrl.trim() !== '' ? (
          <img
            src={getProxyImageUrl(user.profileImageUrl)}
            alt={`${user.nickname} 프로필 이미지`}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill={colors.textSecondary}>
            <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
          </svg>
        )}
      </Avatar>
      <InfoCol>
        <Nickname>{user.nickname}</Nickname>
        <Email>{user.email}</Email>
      </InfoCol>
      <EditLink onClick={onEditClick}>프로필 수정하기 &gt;</EditLink>
    </Container>
  );
};

export default ProfileHeader;

const Container = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 16px;
  background: ${colors.surface};
  padding: 20px;
`;

const Avatar = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: ${colors.bg};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
`;

const InfoCol = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
`;

const Nickname = styled.span`
  font-size: ${typography.size.lg};
  font-weight: ${typography.weight.bold};
  color: ${colors.textPrimary};
`;

const Email = styled.span`
  font-size: ${typography.size.sm};
  color: ${colors.textSecondary};
`;

const EditLink = styled.button`
  background: none;
  border: none;
  padding: 0;
  font-size: ${typography.size.sm};
  color: ${colors.textSecondary};
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
`;
