import React, { useState, useRef, useEffect, useCallback } from 'react';

export interface DropdownItem {
  key: string;
  label: React.ReactNode;
  onClick?: () => void;
  isDanger?: boolean;
  isDisabled?: boolean;
  isDivider?: boolean;
  icon?: React.ReactNode;
}

export interface DropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  placement?: 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end';
  className?: string;
}

export const Dropdown: React.FC<DropdownProps> = ({
  trigger,
  items,
  placement = 'bottom-start',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭
  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(e.target as Node) &&
      triggerRef.current &&
      !triggerRef.current.contains(e.target as Node)
    ) {
      setIsOpen(false);
    }
  }, []);

  // ESC 键关闭
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleClickOutside, handleKeyDown]);

  // 位置样式
  const placementStyles = {
    'bottom-start': 'top-full left-0 mt-1',
    'bottom-end': 'top-full right-0 mt-1',
    'top-start': 'bottom-full left-0 mb-1',
    'top-end': 'bottom-full right-0 mb-1',
  };

  const handleItemClick = (item: DropdownItem) => {
    if (item.isDisabled) return;
    item.onClick?.();
    setIsOpen(false);
  };

  return (
    <div className={`relative inline-block ${className}`}>
      {/* Trigger */}
      <div
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        className="cursor-pointer"
      >
        {trigger}
      </div>

      {/* Menu */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className={`
            absolute z-40 min-w-[160px] py-1
            bg-content1 rounded-medium shadow-lg border border-divider
            animate-fade-in
            ${placementStyles[placement]}
          `.trim().replace(/\s+/g, ' ')}
          role="menu"
        >
          {items.map((item) => {
            // 渲染分隔线
            if (item.isDivider) {
              return (
                <div
                  key={item.key}
                  className="my-1 border-t border-divider"
                  role="separator"
                />
              );
            }
            
            return (
              <button
                key={item.key}
                onClick={() => handleItemClick(item)}
                disabled={item.isDisabled}
                className={`
                  w-full px-3 py-2 text-left text-sm flex items-center gap-2
                  transition-colors outline-none
                  ${item.isDisabled
                    ? 'opacity-50 cursor-not-allowed'
                    : item.isDanger
                      ? 'text-danger hover:bg-danger/10'
                      : 'text-foreground hover:bg-content2'
                  }
                `.trim().replace(/\s+/g, ' ')}
                role="menuitem"
              >
                {item.icon && <span className="w-4 h-4">{item.icon}</span>}
                {item.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Dropdown;
