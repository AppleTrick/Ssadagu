'use client';

import { useState, useCallback } from 'react';
import styled from '@emotion/styled';
import { colors } from '@/shared/styles/theme';

interface ImageCarouselProps {
  images: string[];
  height?: string;
}

const Container = styled.div<{ height: string }>`
  position: relative;
  width: 100%;
  height: ${({ height }) => height};
  overflow: hidden;
  background: ${colors.bg};
  user-select: none;
`;

const ImageWrapper = styled.div<{ index: number; current: number; total: number }>`
  position: absolute;
  inset: 0;
  opacity: ${({ index, current }) => (index === current ? 1 : 0)};
  transition: opacity 0.35s ease;
  pointer-events: ${({ index, current }) => (index === current ? 'auto' : 'none')};
`;

const Img = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`;

const NavButton = styled.button<{ side: 'left' | 'right' }>`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  ${({ side }) => (side === 'left' ? 'left: 12px;' : 'right: 12px;')}
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.35);
  border: none;
  color: #fff;
  font-size: 18px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 2;
  transition: background 0.15s, opacity 0.15s;
  opacity: 0.85;

  &:active {
    background: rgba(0, 0, 0, 0.6);
    opacity: 1;
  }
`;

const DotsRow = styled.div`
  position: absolute;
  bottom: 12px;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  z-index: 2;
`;

const Dot = styled.div<{ active: boolean }>`
  width: ${({ active }) => (active ? '18px' : '6px')};
  height: 6px;
  border-radius: 999px;
  background: ${({ active }) => (active ? colors.primary : 'rgba(255,255,255,0.7)')};
  transition: width 0.25s ease, background 0.25s ease;
`;

const EmptyPlaceholder = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${colors.textSecondary};
  font-size: 14px;
`;

import { getProxyImageUrl } from '@/shared/utils';

const ImageCarousel = ({ images, height = '300px' }: ImageCarouselProps) => {
  const [current, setCurrent] = useState(0);

  const prev = useCallback(() => {
    setCurrent((c) => (c === 0 ? images.length - 1 : c - 1));
  }, [images.length]);

  const next = useCallback(() => {
    setCurrent((c) => (c === images.length - 1 ? 0 : c + 1));
  }, [images.length]);

  if (!images || images.length === 0) {
    return (
      <Container height={height}>
        <EmptyPlaceholder>이미지 없음</EmptyPlaceholder>
      </Container>
    );
  }

  return (
    <Container height={height}>
      {images.map((src, idx) => (
        <ImageWrapper key={src + idx} index={idx} current={current} total={images.length}>
          <Img src={getProxyImageUrl(src)} alt={`이미지 ${idx + 1}`} draggable={false} />
        </ImageWrapper>
      ))}

      {images.length > 1 && (
        <>
          <NavButton side="left" onClick={prev} aria-label="이전 이미지">
            ‹
          </NavButton>
          <NavButton side="right" onClick={next} aria-label="다음 이미지">
            ›
          </NavButton>
          <DotsRow>
            {images.map((_, idx) => (
              <Dot
                key={idx}
                active={idx === current}
                role="button"
                aria-label={`이미지 ${idx + 1}로 이동`}
                onClick={() => setCurrent(idx)}
              />
            ))}
          </DotsRow>
        </>
      )}
    </Container>
  );
};

export default ImageCarousel;
