'use client';

import { Modal } from './Modal';
import { Button } from './Button';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  isLoading = false,
}: ConfirmDialogProps) {
  const handleConfirm = () => {
    onConfirm();
  };

  const variantStyles = {
    danger: 'bg-red-500 hover:bg-red-600',
    warning: 'bg-amber-500 hover:bg-amber-600',
    info: 'bg-blue-500 hover:bg-blue-600',
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-4">
        <p className="text-[var(--muted)]">{message}</p>
        
        <div className="flex gap-3 justify-end">
          <Button
            onClick={onClose}
            variant="secondary"
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className={`px-4 py-2 rounded-lg text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variantStyles[variant]}`}
          >
            {isLoading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}
