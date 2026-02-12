import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  isPressable?: boolean;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  isPressable = false,
  onClick,
}) => {
  // 基础样式
  const baseStyles = `
    bg-content1 rounded-large shadow-sm border border-divider
    transition-all duration-200
  `;

  // 可点击样式
  const pressableStyles = isPressable
    ? `
      cursor-pointer select-none
      hover:shadow-md hover:scale-[1.02] hover:border-primary/30
      active:scale-[0.98]
    `
    : '';

  return (
    <div
      className={`
        ${baseStyles}
        ${pressableStyles}
        ${className}
      `.trim().replace(/\s+/g, ' ')}
      onClick={isPressable ? onClick : undefined}
      role={isPressable ? 'button' : undefined}
      tabIndex={isPressable ? 0 : undefined}
      onKeyDown={
        isPressable
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick?.(e as unknown as React.MouseEvent<HTMLDivElement>);
              }
            }
          : undefined
      }
    >
      {children}
    </div>
  );
};

export default Card;
