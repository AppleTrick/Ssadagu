'use client';

import { useEffect, useRef, useState } from 'react';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';
import { colors } from '@/shared/styles/theme';

interface CameraModalProps {
  isOpen: boolean;
  onCapture: (file: File) => void;
  onClose: () => void;
  onError?: (message: string) => void;
}

export function CameraModal({ isOpen, onCapture, onClose, onError }: CameraModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [ready, setReady] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');

  const startStream = async (facing: 'environment' | 'user') => {
    // 기존 스트림 정리
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setReady(false);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facing },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch {
      onError?.('카메라 접근 권한이 없습니다. 브라우저 설정에서 허용해 주세요.');
      onClose();
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    startStream(facingMode);

    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      setReady(false);
    };
  }, [isOpen]);

  const handleFlip = () => {
    const next = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(next);
    startStream(next);
  };

  const handleCapture = () => {
    if (!videoRef.current || !ready) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d')!.drawImage(videoRef.current, 0, 0);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], `camera_${Date.now()}.jpg`, { type: 'image/jpeg' });
        streamRef.current?.getTracks().forEach((t) => t.stop());
        onCapture(file);
      },
      'image/jpeg',
      0.9,
    );
  };

  if (!isOpen) return null;

  return (
    <Backdrop onClick={onClose}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <VideoWrap>
          <Video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            onCanPlay={() => setReady(true)}
          />
          {!ready && <LoadingOverlay>카메라 준비 중...</LoadingOverlay>}
        </VideoWrap>

        <Controls>
          <IconButton onClick={onClose} aria-label="닫기">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </IconButton>

          <ShutterButton onClick={handleCapture} disabled={!ready} aria-label="촬영">
            <ShutterInner />
          </ShutterButton>

          <IconButton onClick={handleFlip} aria-label="카메라 전환">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 4v6h6" />
              <path d="M23 20v-6h-6" />
              <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4-4.64 4.36A9 9 0 0 1 3.51 15" />
            </svg>
          </IconButton>
        </Controls>
      </Modal>
    </Backdrop>
  );
}

const fadeIn = keyframes`from { opacity: 0; } to { opacity: 1; }`;

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: 100;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: ${fadeIn} 0.2s ease-out;
`;

const Modal = styled.div`
  width: 100%;
  max-width: 480px;
  display: flex;
  flex-direction: column;
  gap: 0;
`;

const VideoWrap = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 3 / 4;
  background: #000;
  overflow: hidden;
`;

const Video = styled.video`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const LoadingOverlay = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 14px;
  background: rgba(0, 0, 0, 0.5);
`;

const Controls = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 40px;
  background: #111;
`;

const IconButton = styled.button`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  &:active { opacity: 0.7; }
`;

const ShutterButton = styled.button`
  width: 68px;
  height: 68px;
  border-radius: 50%;
  border: 4px solid #fff;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: opacity 0.15s;
  &:disabled { opacity: 0.4; cursor: default; }
  &:not(:disabled):active { opacity: 0.7; }
`;

const ShutterInner = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: #fff;
`;
