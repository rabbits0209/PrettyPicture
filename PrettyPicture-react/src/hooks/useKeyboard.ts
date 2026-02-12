import { useEffect } from 'react';

interface KeyboardOptions {
  onPaste?: (files: File[]) => void;
  onEscape?: () => void;
}

export const useKeyboard = ({ onPaste, onEscape }: KeyboardOptions) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape key
      if (e.key === 'Escape' && onEscape) {
        onEscape();
      }
    };

    const handlePaste = (e: ClipboardEvent) => {
      if (!onPaste) return;

      const items = e.clipboardData?.items;
      if (!items) return;

      const files: File[] = [];
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            files.push(file);
          }
        }
      }

      if (files.length > 0) {
        e.preventDefault();
        onPaste(files);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('paste', handlePaste);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('paste', handlePaste);
    };
  }, [onPaste, onEscape]);
};

export default useKeyboard;
