import React from 'react';

export interface Tab {
  key: string;
  title: React.ReactNode;
  icon?: React.ReactNode;
  isDisabled?: boolean;
}

export interface TabsProps {
  tabs: Tab[];
  selectedKey: string;
  onSelectionChange: (key: string) => void;
  variant?: 'solid' | 'underlined' | 'bordered';
  color?: 'primary' | 'default';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  selectedKey,
  onSelectionChange,
  variant = 'solid',
  color = 'primary',
  size = 'md',
  className = '',
}) => {
  // 尺寸样式
  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5',
    md: 'text-sm px-4 py-2',
    lg: 'text-base px-5 py-2.5',
  };

  // 容器样式
  const containerStyles = {
    solid: 'bg-content2 p-1 rounded-medium',
    underlined: 'border-b border-divider',
    bordered: 'border border-divider rounded-medium p-1',
  };

  // 获取 Tab 样式
  const getTabStyles = (isSelected: boolean, isDisabled: boolean): string => {
    if (isDisabled) {
      return 'opacity-50 cursor-not-allowed';
    }

    if (variant === 'solid') {
      if (isSelected) {
        return color === 'primary'
          ? 'bg-primary text-primary-foreground shadow-sm'
          : 'bg-content1 text-foreground shadow-sm';
      }
      return 'text-foreground/60 hover:text-foreground hover:bg-content1/50';
    }

    if (variant === 'underlined') {
      if (isSelected) {
        return color === 'primary'
          ? 'text-primary border-b-2 border-primary -mb-px'
          : 'text-foreground border-b-2 border-foreground -mb-px';
      }
      return 'text-foreground/60 hover:text-foreground border-b-2 border-transparent -mb-px';
    }

    if (variant === 'bordered') {
      if (isSelected) {
        return color === 'primary'
          ? 'bg-primary/10 text-primary border border-primary/30'
          : 'bg-content1 text-foreground border border-divider';
      }
      return 'text-foreground/60 hover:text-foreground hover:bg-content1/50 border border-transparent';
    }

    return '';
  };

  return (
    <div
      className={`flex ${containerStyles[variant]} ${className}`}
      role="tablist"
    >
      {tabs.map((tab) => {
        const isSelected = tab.key === selectedKey;
        const isDisabled = tab.isDisabled ?? false;

        return (
          <button
            key={tab.key}
            onClick={() => !isDisabled && onSelectionChange(tab.key)}
            disabled={isDisabled}
            className={`
              ${sizeStyles[size]}
              flex items-center gap-2 font-medium rounded-small
              transition-all duration-200 outline-none
              focus:ring-2 focus:ring-primary/50
              ${getTabStyles(isSelected, isDisabled)}
            `.trim().replace(/\s+/g, ' ')}
            role="tab"
            aria-selected={isSelected}
            tabIndex={isSelected ? 0 : -1}
          >
            {tab.icon && <span className="w-4 h-4">{tab.icon}</span>}
            {tab.title}
          </button>
        );
      })}
    </div>
  );
};

// 单个 TabItem 组件（用于更灵活的场景）
export interface TabItemProps {
  children: React.ReactNode;
  isSelected?: boolean;
  isDisabled?: boolean;
  onClick?: () => void;
  variant?: 'solid' | 'underlined' | 'bordered';
  color?: 'primary' | 'default';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  icon?: React.ReactNode;
}

export const TabItem: React.FC<TabItemProps> = ({
  children,
  isSelected = false,
  isDisabled = false,
  onClick,
  variant = 'solid',
  color = 'primary',
  size = 'md',
  className = '',
  icon,
}) => {
  // 尺寸样式
  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5',
    md: 'text-sm px-4 py-2',
    lg: 'text-base px-5 py-2.5',
  };

  // 获取样式
  const getStyles = (): string => {
    if (isDisabled) {
      return 'opacity-50 cursor-not-allowed';
    }

    if (variant === 'solid') {
      if (isSelected) {
        return color === 'primary'
          ? 'bg-primary text-primary-foreground shadow-sm'
          : 'bg-content1 text-foreground shadow-sm';
      }
      return 'text-foreground/60 hover:text-foreground hover:bg-content1/50';
    }

    if (variant === 'underlined') {
      if (isSelected) {
        return color === 'primary'
          ? 'text-primary border-b-2 border-primary'
          : 'text-foreground border-b-2 border-foreground';
      }
      return 'text-foreground/60 hover:text-foreground border-b-2 border-transparent';
    }

    if (variant === 'bordered') {
      if (isSelected) {
        return color === 'primary'
          ? 'bg-primary/10 text-primary border border-primary/30'
          : 'bg-content1 text-foreground border border-divider';
      }
      return 'text-foreground/60 hover:text-foreground hover:bg-content1/50 border border-transparent';
    }

    return '';
  };

  return (
    <button
      onClick={!isDisabled ? onClick : undefined}
      disabled={isDisabled}
      className={`
        ${sizeStyles[size]}
        flex items-center gap-2 font-medium rounded-small
        transition-all duration-200 outline-none
        focus:ring-2 focus:ring-primary/50
        ${getStyles()}
        ${className}
      `.trim().replace(/\s+/g, ' ')}
      role="tab"
      aria-selected={isSelected}
    >
      {icon && <span className="w-4 h-4">{icon}</span>}
      {children}
    </button>
  );
};

export default Tabs;
