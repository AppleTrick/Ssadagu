'use client';

import { useState } from 'react';
import styled from '@emotion/styled';
import { colors, radius, typography } from '@/shared/styles/theme';

interface InputProps {
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: React.HTMLInputTypeAttribute;
  disabled?: boolean;
  label?: string;
  error?: string;
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
`;

const Label = styled.label`
  font-family: ${typography.fontFamily};
  font-size: ${typography.size.sm};
  font-weight: ${typography.weight.medium};
  color: ${colors.textPrimary};
`;

const StyledInput = styled.input<{ hasError: boolean; disabled?: boolean }>`
  width: 100%;
  height: 52px;
  padding: 0 16px;
  font-family: ${typography.fontFamily};
  font-size: ${typography.size.md};
  color: ${colors.textPrimary};
  background: ${({ disabled }) => (disabled ? colors.bg : colors.surface)};
  border: 1.5px solid
    ${({ hasError, disabled }) =>
      disabled ? colors.disabled : hasError ? colors.red : colors.border};
  border-radius: ${radius.pill};
  outline: none;
  transition: border-color 0.15s;
  box-sizing: border-box;
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'text')};

  &::placeholder {
    color: ${colors.textSecondary};
  }

  &:focus:not(:disabled) {
    border-color: ${({ hasError }) => (hasError ? colors.red : colors.primary)};
  }
`;

const ErrorText = styled.span`
  font-family: ${typography.fontFamily};
  font-size: ${typography.size.xs};
  color: ${colors.red};
  padding-left: 4px;
`;

const Input = ({
  value,
  onChange,
  placeholder,
  type = 'text',
  disabled,
  label,
  error,
}: InputProps) => {
  const [id] = useState(() => `input-${Math.random().toString(36).slice(2, 8)}`);

  return (
    <Wrapper>
      {label && <Label htmlFor={id}>{label}</Label>}
      <StyledInput
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        hasError={!!error}
      />
      {error && <ErrorText>{error}</ErrorText>}
    </Wrapper>
  );
};

export default Input;
