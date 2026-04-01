'use client';

import { useState } from 'react';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';
import { colors, typography } from '@/shared/styles/theme';
import { LocationPickerMap } from '@/features/location-picker';
import Button from '@/shared/ui/Button';

interface ChatMapPickerSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (lat: number, lng: number, locationName: string) => void;
}

const slideUp = keyframes`
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const Overlay = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.6);
  z-index: 9000;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  animation: ${fadeIn} 0.2s ease-out forwards;
`;

const Content = styled.div`
  background: ${colors.surface};
  border-radius: 20px 20px 0 0;
  padding: 24px 20px 32px;
  animation: ${slideUp} 0.3s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
  display: flex;
  flex-direction: column;
  gap: 20px;
  box-shadow: 0 -4px 16px rgba(0,0,0,0.1);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.h2`
  font-family: ${typography.fontFamily};
  font-size: ${typography.size.lg};
  font-weight: ${typography.weight.bold};
  color: ${colors.textPrimary};
  margin: 0;
`;

const CloseIconButton = styled.button`
  background: none; border: none; padding: 4px; cursor: pointer;
  color: ${colors.textSecondary};
  display: flex; align-items: center; justify-content: center;
  &:active { background: ${colors.bg}; border-radius: 50%; }
`;

const MapContainer = styled.div`
  height: 280px;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid ${colors.border};
`;

const SummaryRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const Label = styled.div`
  font-size: ${typography.size.sm};
  color: ${colors.textSecondary};
`;

const CurrentLocation = styled.div`
  font-size: ${typography.size.lg};
  font-weight: ${typography.weight.bold};
  color: ${colors.textPrimary};
`;

const ChatMapPickerSheet = ({ isOpen, onClose, onSubmit }: ChatMapPickerSheetProps) => {
  const [regionName, setRegionName] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [mapInstance, setMapInstance] = useState<any>(null);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!mapInstance) return;
    const center = mapInstance.getCenter();
    const lat = center.getLat();
    const lng = center.getLng();
    onSubmit(lat, lng, regionName || '선택한 위치');
  };

  // slideUp 애니메이션 종료 후 relayout 호출
  // (CSS transform 안에서 초기화된 카카오 맵의 히트 영역 재계산)
  const handleAnimationEnd = () => {
    mapInstance?.relayout();
  };

  return (
    <Overlay onClick={onClose}>
      <Content onClick={(e) => e.stopPropagation()} onAnimationEnd={handleAnimationEnd}>
        <Header>
          <Title>지도 공유하기</Title>
          <CloseIconButton onClick={onClose} aria-label="닫기">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </CloseIconButton>
        </Header>
        
        <MapContainer>
          <LocationPickerMap 
            height="100%" 
            onLocationChange={(name) => setRegionName(name)} 
            onMapReady={(map) => setMapInstance(map)} 
          />
        </MapContainer>
        
        <SummaryRow>
          <Label>위치 정보</Label>
          <CurrentLocation>{regionName || '위치 찾는 중...'}</CurrentLocation>
        </SummaryRow>

        <Button size="lg" variant="primary" fullWidth onClick={handleSubmit} disabled={!regionName}>
          이 위치 공유하기
        </Button>
      </Content>
    </Overlay>
  );
};

export default ChatMapPickerSheet;
