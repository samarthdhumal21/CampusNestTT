import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { AuthForm } from './AuthForm';

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  triggerRef?: React.RefObject<HTMLElement | null>;
}

export const SignInModal: React.FC<SignInModalProps> = ({ 
  isOpen, 
  onClose,
  triggerRef 
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  // Lock body scroll and trap focus while open
  useEffect(() => {
    if (!isOpen) return;

    // Save previous overflow state
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Move focus inside the modal
    const focusTimer = setTimeout(() => {
      closeBtnRef.current?.focus();
    }, 50);

    // Keyboard handlers: Escape to close, Tab to cycle focus inside modal
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const focusable = Array.from(focusableElements).filter(
          el => !el.hasAttribute('disabled') && el.offsetParent !== null
        );

        if (focusable.length === 0) return;

        const firstElement = focusable[0];
        const lastElement = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(focusTimer);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);

      // Return focus to the trigger button that opened the modal
      if (triggerRef?.current) {
        triggerRef.current.focus();
      }
    };
  }, [isOpen, onClose, triggerRef]);

  if (!isOpen) return null;

  // Handle overlay background click (outside the white card)
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="modal-overlay"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="signin-modal-title"
    >
      <div 
        ref={modalRef} 
        className="auth-modal-card"
        onClick={e => e.stopPropagation()}
      >
        {/* Top-Right Close Button */}
        <button
          ref={closeBtnRef}
          type="button"
          onClick={onClose}
          aria-label="Close sign-in dialog"
          className="modal-close-btn"
        >
          <X size={18} />
        </button>

        {/* Unified Auth Form */}
        <AuthForm
          variant="modal"
          onSuccess={onClose}
        />
      </div>
    </div>
  );
};
