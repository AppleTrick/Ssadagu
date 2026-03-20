'use client';

import styled from '@emotion/styled';
import { colors, typography } from '@/shared/styles/theme';
import SharedLocationViewer from '@/features/shared-location-viewer/ui/SharedLocationViewer';

interface MapChatBubbleProps {
  lat: number;
  lng: number;
  label?: string | null;
  isMine: boolean;
  senderNickname?: string;
  sentAt?: string | null;
}

const formatTime = (dateStr: string | null | undefined) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours < 12 ? '오전' : '오후';
  const h = hours % 12 || 12;
  const m = minutes.toString().padStart(2, '0');
  return `${ampm} ${h}:${m}`;
};

const MapChatBubble = ({ lat, lng, label, isMine, senderNickname, sentAt }: MapChatBubbleProps) => {
  const mapLink = `https://map.kakao.com/link/map/${label ? encodeURIComponent(label) : '위치'},${lat},${lng}`;

  const mainLabel = label || '선택한 위치';
  const subLabel = label ? `위도: ${lat.toFixed(4)}, 경도: ${lng.toFixed(4)}` : '상세 주소를 확인하려면 탭하세요.';

  return (
    <Row $isMine={isMine}>
      {!isMine && (
        <Avatar>
          <svg width="16" height="16" viewBox="0 0 24 24" fill={colors.textSecondary}>
            <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
          </svg>
        </Avatar>
      )}
      <ContentCol $isMine={isMine}>
        {!isMine && (
          <Nickname $isMine={isMine}>
            {senderNickname}
          </Nickname>
        )}
        <BubbleRow $isMine={isMine}>
          {isMine && <TimeText>{formatTime(sentAt)}</TimeText>}
          <CardBubble $isMine={isMine} href={mapLink} target="_blank" rel="noopener noreferrer">
            <div style={{ pointerEvents: 'none' }}>
              <SharedLocationViewer lat={lat} lng={lng} height="120px" zoom={3} panY={-25} />
            </div>
            <BottomArea>
              <MapLabel>{mainLabel}</MapLabel>
              <MapAction>{subLabel}</MapAction>
            </BottomArea>
          </CardBubble>
          {!isMine && <TimeText>{formatTime(sentAt)}</TimeText>}
        </BubbleRow>
      </ContentCol>
    </Row>
  );
};

export default MapChatBubble;

const Row = styled.div<{ $isMine: boolean }>`
  display: flex;
  flex-direction: row;
  justify-content: ${({ $isMine }) => ($isMine ? 'flex-end' : 'flex-start')};
  align-items: flex-start;
  gap: 8px;
  padding: 4px 16px;
  width: 100%;
`;

const Avatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${colors.bg};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 2px;
`;

const ContentCol = styled.div<{ $isMine: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: ${({ $isMine }) => ($isMine ? 'flex-end' : 'flex-start')};
  gap: 4px;
`;

const Nickname = styled.span<{ $isMine: boolean }>`
  font-size: ${typography.size.xs};
  color: ${colors.textSecondary};
  font-weight: ${typography.weight.medium};
  margin-right: ${({ $isMine }) => ($isMine ? '2px' : '0')};
  margin-left: ${({ $isMine }) => ($isMine ? '0' : '2px')};
`;

const BubbleRow = styled.div<{ $isMine: boolean }>`
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  gap: 6px;
`;

const CardBubble = styled.a<{ $isMine: boolean }>`
  width: 220px;
  display: flex;
  flex-direction: column;
  background: ${colors.surface};
  border: 1px solid rgba(0, 0, 0, 0.05);
  border-radius: ${({ $isMine }) => ($isMine ? '18px 4px 18px 18px' : '4px 18px 18px 18px')};
  overflow: hidden;
  text-decoration: none;
  transition: opacity 0.2s;
  
  &:active {
    opacity: 0.8;
  }
`;

const BottomArea = styled.div`
  background: ${colors.primary};
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const MapLabel = styled.div`
  font-size: ${typography.size.sm};
  font-weight: ${typography.weight.bold};
  color: #ffffff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const MapAction = styled.div`
  font-size: 11px;
  color: rgba(255, 255, 255, 0.8);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const TimeText = styled.span`
  font-size: ${typography.size.xs};
  color: ${colors.textSecondary};
  flex-shrink: 0;
  line-height: 1;
`;
