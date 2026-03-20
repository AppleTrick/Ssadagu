'use client';

import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';
import { colors, radius, typography } from '@/shared/styles/theme';

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const Spinner = styled.div`
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: currentColor;
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
`;

type Variant = 'primary' | 'outline' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  loading?: boolean;
}

const variantStyles: Record<Variant, string> = {
  primary: `background: ${colors.primary}; color: ${colors.textWhite};`,
  outline: `background: transparent; color: ${colors.primary}; border: 1.5px solid ${colors.primary};`,
  ghost: `background: transparent; color: ${colors.textPrimary};`,
  danger: `background: ${colors.red}; color: ${colors.textWhite};`,
};

const sizeStyles: Record<Size, string> = {
  sm: `height: 36px; padding: 0 16px; font-size: ${typography.size.sm};`,
  md: `height: 48px; padding: 0 20px; font-size: ${typography.size.md};`,
  lg: `height: 56px; padding: 0 24px; font-size: ${typography.size.lg};`,
};

const StyledButton = styled.button<{ variant: Variant; size: Size; fullWidth: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: ${radius.md}; /* pill보다 md가 전위적인 느낌 */
  font-family: ${typography.fontFamily};
  font-weight: ${typography.weight.semibold};
  transition: opacity 0.15s, transform 0.1s;
  ${({ variant }) => variantStyles[variant]}
  ${({ size }) => sizeStyles[size]}
  ${({ fullWidth }) => fullWidth && 'width: 100%;'}
  border: none;
  outline: none;
  cursor: pointer;

  &:disabled {
    background: ${colors.disabled};
    color: ${colors.textWhite};
    border: none;
    cursor: not-allowed;
  }

  &:active:not(:disabled) {
    transform: scale(0.98);
    opacity: 0.85;
  }
`;

const Button = ({
  variant = 'primary',
  size = 'lg',
  fullWidth = false,
  loading,
  children,
  disabled,
  ...rest
}: ButtonProps) => (
  <StyledButton
    variant={variant}
    size={size}
    fullWidth={fullWidth}
    disabled={disabled || loading}
    {...rest}
  >
    {loading ? <Spinner /> : children}
  </StyledButton>
);

export default Button;
