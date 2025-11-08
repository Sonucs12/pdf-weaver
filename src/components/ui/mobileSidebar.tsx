
'use client';

import { useEffect, useState, useCallback, ReactNode } from 'react';
import ReactDOM from 'react-dom';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Types
interface SidebarProps {
  children: ReactNode | ((context: { close: () => void }) => ReactNode);
  trigger?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  side?: 'left' | 'right';
  width?: string;
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  className?: string;
  headerContent?: ReactNode; // New prop for header content
}

// Styles
const sidebarStyles = {
  overlay: 'fixed inset-0 z-50 bg-black/50 backdrop-blur-sm',
  container: (side: 'left' | 'right', width: string) =>
    cn(
      'fixed top-0 z-50 h-full bg-background border shadow-lg transform transition-transform duration-300 ease-in-out',
      side === 'right' ? 'right-0 border-l' : 'left-0 border-r',
      width
    ),
  header: 'flex items-center justify-between p-4 border-b border-border',
  content: 'flex-1 h-full overflow-y-auto scrollbar-hide',
  closeButton:
    'h-8 w-8 px-0 hover:bg-accent/50 dark:hover:bg-accent/50 transition-colors',
};

export function Sidebar({
  children,
  trigger,
  open: controlledOpen,
  onOpenChange,
  side = 'right',
  width = 'w-80',
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  className,
  headerContent, // Destructure new prop
}: SidebarProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setIsOpen = onOpenChange || setInternalOpen;

  const openSidebar = useCallback(() => {
    setIsOpen(true);
  }, [setIsOpen]);

  const closeSidebar = useCallback(() => {
    setIsOpen(false);
  }, [setIsOpen]);

  const handleOverlayClick = useCallback(() => {
    if (closeOnOverlayClick) {
      closeSidebar();
    }
  }, [closeOnOverlayClick, closeSidebar]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (closeOnEscape && e.key === 'Escape') {
        closeSidebar();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, closeOnEscape, closeSidebar]);

  const getTransformClass = () => {
    if (side === 'right') {
      return isOpen ? 'translate-x-0' : 'translate-x-full';
    }
    return isOpen ? 'translate-x-0' : '-translate-x-full';
  };

  const sidebarContent = (
    <>
      {isOpen && (
        <div className={sidebarStyles.overlay} onClick={handleOverlayClick} />
      )}
      <div
        className={cn(
          sidebarStyles.container(side, width),
          getTransformClass(),
          className
        )}
      >
        <div className="flex flex-col h-full">
          {showCloseButton && (
            <div className={sidebarStyles.header}>
              {headerContent} {/* Render header content here */}
              <div className="flex-1" />
              <Button
                variant="ghost"
                size="sm"
                onClick={closeSidebar}
                className={sidebarStyles.closeButton}
              >
                <X className="h-6 w-6" />
                <span className="sr-only">Close sidebar</span>
              </Button>
            </div>
          )}
          <div className={sidebarStyles.content}>
            {typeof children === 'function'
              ? children({ close: closeSidebar })
              : children}
          </div>
        </div>
      </div>
    </>
  );

  if (!isMounted) {
    return null;
  }

  return (
    <>
      {trigger && (
        <div onClick={openSidebar} className="cursor-pointer">
          {trigger}
        </div>
      )}
      {ReactDOM.createPortal(sidebarContent, document.body)}
    </>
  );
}

export function useSidebar(defaultOpen = false) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  return {
    isOpen,
    open,
    close,
    toggle,
    setIsOpen,
  };
}
