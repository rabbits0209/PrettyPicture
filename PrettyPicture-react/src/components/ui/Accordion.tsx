import React, { useState } from 'react';

export interface AccordionItem {
  key: string;
  title: React.ReactNode;
  content: React.ReactNode;
  subtitle?: React.ReactNode;
  startContent?: React.ReactNode;
}

export interface AccordionProps {
  items: AccordionItem[];
  selectionMode?: 'single' | 'multiple';
  defaultExpandedKeys?: string[];
  className?: string;
  variant?: 'light' | 'bordered' | 'shadow';
}

export const Accordion: React.FC<AccordionProps> = ({
  items,
  selectionMode = 'single',
  defaultExpandedKeys = [],
  className = '',
  variant = 'light',
}) => {
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(
    new Set(defaultExpandedKeys)
  );

  const toggleItem = (key: string) => {
    setExpandedKeys((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        if (selectionMode === 'single') {
          newSet.clear();
        }
        newSet.add(key);
      }
      return newSet;
    });
  };

  // 变体样式
  const variantStyles = {
    light: '',
    bordered: 'border border-divider rounded-medium',
    shadow: 'shadow-md rounded-medium bg-content1',
  };

  return (
    <div className={`${variantStyles[variant]} ${className}`}>
      {items.map((item, index) => {
        const isExpanded = expandedKeys.has(item.key);
        const isFirst = index === 0;
        const isLast = index === items.length - 1;

        return (
          <div
            key={item.key}
            className={`
              ${variant === 'light' && !isFirst ? 'border-t border-divider' : ''}
              ${variant === 'bordered' && !isFirst ? 'border-t border-divider' : ''}
            `}
          >
            {/* Header */}
            <button
              onClick={() => toggleItem(item.key)}
              className={`
                w-full px-4 py-3 flex items-center gap-3 text-left
                transition-colors hover:bg-content2/50
                ${variant === 'bordered' && isFirst ? 'rounded-t-medium' : ''}
                ${variant === 'bordered' && isLast && !isExpanded ? 'rounded-b-medium' : ''}
                ${variant === 'shadow' && isFirst ? 'rounded-t-medium' : ''}
                ${variant === 'shadow' && isLast && !isExpanded ? 'rounded-b-medium' : ''}
              `.trim().replace(/\s+/g, ' ')}
              aria-expanded={isExpanded}
            >
              {/* Start Content */}
              {item.startContent && (
                <span className="flex-shrink-0">{item.startContent}</span>
              )}

              {/* Title & Subtitle */}
              <div className="flex-1 min-w-0">
                <div className="font-medium text-foreground">{item.title}</div>
                {item.subtitle && (
                  <div className="text-sm text-foreground/60 mt-0.5">
                    {item.subtitle}
                  </div>
                )}
              </div>

              {/* Chevron Icon */}
              <svg
                className={`
                  w-5 h-5 text-foreground/60 transition-transform duration-200
                  ${isExpanded ? 'rotate-180' : ''}
                `}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {/* Content */}
            <div
              className={`
                overflow-hidden transition-all duration-200
                ${isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}
              `}
            >
              <div
                className={`
                  px-4 pb-4 pt-1 text-foreground/80
                  ${item.startContent ? 'pl-[52px]' : ''}
                `}
              >
                {item.content}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Accordion;
