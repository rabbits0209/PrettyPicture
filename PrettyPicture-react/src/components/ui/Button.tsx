import React from 'react';

export interface ButtonProps {
  children: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  variant?: 'solid' | 'flat' | 'ghost';
  color?: 'primary' | 'default' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  isDisabled?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  title?: string;
}

// Loading Spinner 组件
const LoadingSpinner: React.FC<{ size: 'sm' | 'md' | 'lg' }> = ({ size }) => {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <svg
      className={`animate-spin ${sizeClasses[size]}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
};

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'solid',
  color = 'primary',
  size = 'md',
  isLoading = false,
  isDisabled = false,
  className = '',
  type = 'button',
  title,
}) => {
  // 尺寸样式
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2.5',
  };

  // 基础样式
  const baseStyles = `
    rounded-medium font-medium transition-all duration-200 
    flex items-center justify-center select-none outline-none
    focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background
  `;

  // 禁用状态样式
  const disabledStyles = 'opacity-50 cursor-not-allowed pointer-events-none';

  // 根据 variant 和 color 生成颜色样式
  const getColorStyles = (): string => {
    if (variant === 'solid') {
      switch (color) {
        case 'primary':
          return 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/20';
        case 'danger':
          return 'bg-danger text-white hover:bg-danger/90 shadow-md shadow-danger/20';
        case 'success':
          return 'bg-success text-white hover:bg-success/90 shadow-md shadow-success/20';
        case 'default':
        default:
          return 'bg-foreground text-background hover:opacity-90';
      }
    }

    if (variant === 'flat') {
      switch (color) {
        case 'primary':
          return 'bg-primary/10 text-primary hover:bg-primary/20';
        case 'danger':
          return 'bg-danger/10 text-danger hover:bg-danger/20';
        case 'success':
          return 'bg-success/10 text-success hover:bg-success/20';
        case 'default':
        default:
          return 'bg-content2 text-foreground hover:bg-content3';
      }
    }

    if (variant === 'ghost') {
      switch (color) {
        case 'primary':
          return 'border border-primary text-primary hover:bg-primary hover:text-primary-foreground';
        case 'danger':
          return 'border border-danger text-danger hover:bg-danger hover:text-white';
        case 'success':
          return 'border border-success text-success hover:bg-success hover:text-white';
        case 'default':
        default:
          return 'border border-divider text-foreground hover:bg-content2';
      }
    }

    return '';
  };

  // 活跃状态样式
  const activeStyles = !isDisabled && !isLoading ? 'active:scale-[0.98]' : '';

  const disabled = isDisabled || isLoading;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`
        ${baseStyles}
        ${sizeStyles[size]}
        ${getColorStyles()}
        ${activeStyles}
        ${disabled ? disabledStyles : ''}
        ${className}
      `.trim().replace(/\s+/g, ' ')}
    >
      {isLoading && <LoadingSpinner size={size} />}
      {children}
    </button>
  );
};

export default Button;
