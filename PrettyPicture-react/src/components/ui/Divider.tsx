import React from 'react';

export interface DividerProps {
  className?: string;
  orientation?: 'horizontal' | 'vertical';
}

export const Divider: React.FC<DividerProps> = ({
  className = '',
  orientation = 'horizontal',
}) => {
  const baseStyles = 'bg-divider shrink-0';

  const orientationStyles =
    orientation === 'horizontal' ? 'h-px w-full my-2' : 'w-px h-full mx-2';

  return (
    <div
      className={`${baseStyles} ${orientationStyles} ${className}`.trim()}
      role="separator"
      aria-orientation={orientation}
    />
  );
};

export default Divider;
