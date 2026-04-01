'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import styled from '@emotion/styled';
import Button from '@/shared/ui/Button';
import { colors, typography } from '@/shared/styles/theme';

/**
 * 404 Not Found 화면 컴포넌트
 * 요청한 페이지가 없거나 삭제된 경우에 표시됩니다.
 */
export const NotFoundPage = () => {
  const router = useRouter();

  const handleGoHome = () => {
    router.push('/');
  };

  return (
    <Container>
      <ContentWrapper>
        {/* 아이콘: 돋보기 안에 X 표시 */}
        <IconCircle>
          <svg
            width='32'
            height='32'
            viewBox='0 0 24 24'
            fill='none'
            stroke={colors.textSecondary}
            strokeWidth='2.5'
            strokeLinecap='round'
            strokeLinejoin='round'
          >
            {/* 돋보기 원 */}
            <circle cx='10.5' cy='10.5' r='7.5' />
            {/* 돋보기 손잡이 */}
            <line x1='21' y1='21' x2='15.8' y2='15.8' />
            {/* X 표시 - 더 직관적인 X 모양으로 위치 조정 */}
            <line x1='8' y1='8' x2='13' y2='13' />
            <line x1='13' y1='8' x2='8' y2='13' />
          </svg>
        </IconCircle>

        {/* 404 텍스트 */}
        <ErrorCode>404</ErrorCode>

        {/* 대제목 */}
        <Title>페이지를 찾을 수 없어요</Title>

        {/* 설명문 */}
        <Description>
          요청하신 페이지가 존재하지 않거나
          <br />
          삭제된 페이지예요
        </Description>

        {/* 홈으로 이동 버튼 */}
        <StyledHomeButton
          fullWidth
          onClick={handleGoHome}
        >
          홈으로 돌아가기
        </StyledHomeButton>
      </ContentWrapper>
    </Container>
  );
};

/* ── Styled Components ───────────────────────────────────── */

const Container = styled.div`
  display: flex;
  min-height: 100vh;
  width: 100%;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: ${colors.surface};
  padding: 0 24px;
  box-sizing: border-box;
`;

const ContentWrapper = styled.div`
  display: flex;
  width: 100%;
  max-width: 390px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const IconCircle = styled.div`
  margin-bottom: 32px;
  display: flex;
  height: 80px;
  width: 80px;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background-color: ${colors.bg};
`;

const ErrorCode = styled.h1`
  color: ${colors.textPrimary};
  margin: 0 0 12px 0;
  font-size: 64px;
  font-weight: 900;
  line-height: 1;
  letter-spacing: -1.5px;
  font-family: ${typography.fontFamily};
`;

const Title = styled.h2`
  color: ${colors.textPrimary};
  margin: 0 0 16px 0;
  font-size: 24px;
  font-weight: ${typography.weight.bold};
  font-family: ${typography.fontFamily};
`;

const Description = styled.p`
  color: ${colors.textSecondary};
  margin: 0 0 40px 0;
  text-align: center;
  font-size: 16px;
  line-height: 1.6;
  font-family: ${typography.fontFamily};
`;

const StyledHomeButton = styled(Button)`
  max-width: 342px;
  border-radius: 14px !important; // 이미지의 곡률에 더 가깝게 조정
  font-size: 17px;
  font-weight: 700;
  height: 56px;
`;
