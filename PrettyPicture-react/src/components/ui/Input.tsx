import React, { useId } from 'react';

export interface InputProps {
  label?: string;
  placeholder?: string;
  type?: 'text' | 'password' | 'email' | 'number';
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  isDisabled?: boolean;
  startContent?: React.ReactNode;
  endContent?: React.ReactNode;
  className?: string;
  name?: string;
  autoComplete?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  placeholder,
  type = 'text',
  value,
  onChange,
  error,
  isDisabled = false,
  startContent,
  endContent,
  className = '',
  name,
  autoComplete,
}) => {
  const inputId = useId();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.value);
  };

  // 容器样式
  const containerStyles = 'flex flex-col gap-1.5 w-full';

  // 标签样式
  const labelStyles = 'text-sm font-medium text-foreground';

  // 输入框包装器样式
  const wrapperBaseStyles = `
    flex items-center gap-2 px-3 py-2
    bg-content2 rounded-medium border
    transition-all duration-200
    focus-within:ring-2 focus-within:ring-primary/50
  `;

  const wrapperStateStyles = error
    ? 'border-danger focus-within:border-danger'
    : 'border-divider focus-within:border-primary hover:border-primary/50';

  const wrapperDisabledStyles = isDisabled
    ? 'opacity-50 cursor-not-allowed bg-content3'
    : '';

  // 输入框样式
  const inputStyles = `
    flex-1 bg-transparent outline-none text-foreground
    placeholder:text-foreground/40 text-sm
    disabled:cursor-not-allowed
  `;

  // 图标样式
  const iconStyles = 'text-foreground/60 shrink-0';

  // 错误消息样式
  const errorStyles = 'text-xs text-danger';

  return (
    <div className={`${containerStyles} ${className}`}>
      {label && (
        <label htmlFor={inputId} className={labelStyles}>
          {label}
        </label>
      )}
      <div
        className={`
          ${wrapperBaseStyles}
          ${wrapperStateStyles}
          ${wrapperDisabledStyles}
        `.trim().replace(/\s+/g, ' ')}
      >
        {startContent && <span className={iconStyles}>{startContent}</span>}
        <input
          id={inputId}
          type={type}
          name={name}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={isDisabled}
          autoComplete={autoComplete}
          className={inputStyles.trim().replace(/\s+/g, ' ')}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
        />
        {endContent && <span className={iconStyles}>{endContent}</span>}
      </div>
      {error && (
        <span id={`${inputId}-error`} className={errorStyles} role="alert">
          {error}
        </span>
      )}
    </div>
  );
};

export default Input;
