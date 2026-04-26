'use client';

import { X } from 'lucide-react';
import {
  useId,
  type HTMLAttributes,
  type MouseEvent,
  type ReactNode,
} from 'react';
import OverlayLayer from '../overlay/OverlayLayer';
import ModalPortal from './ModalPortal';
import useLockViewportScroll from './useLockViewportScroll';
import { cx } from '@/shared/lib/classNames';
import styles from './Modal.module.scss';

export interface ModalAction {
  autoClose?: boolean;
  label: string;
  onClick?: () => void;
  tone?: 'primary' | 'secondary';
}

export interface ModalProps extends HTMLAttributes<HTMLDivElement> {
  actions?: ModalAction[];
  children?: ReactNode;
  closeOnBackdrop?: boolean;
  description?: string;
  onClose?: () => void;
  open: boolean;
  showCloseButton?: boolean;
  title: string;
}

export type ModalConfig = Omit<ModalProps, 'open'>;

const Modal = ({
  actions = [],
  children,
  className,
  closeOnBackdrop,
  description,
  onClose,
  open,
  showCloseButton,
  title,
  ...rest
}: ModalProps) => {
  const titleId = useId();
  const descriptionId = useId();
  const shouldShowCloseButton = showCloseButton ?? actions.length === 0;
  const canCloseOnBackdrop = closeOnBackdrop ?? actions.length === 0;

  useLockViewportScroll(open);

  if (!open) {
    return null;
  }

  const handleBackdropClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget || !canCloseOnBackdrop) {
      return;
    }

    onClose?.();
  };

  const handleActionClick = (action: ModalAction) => {
    action.onClick?.();

    if (action.autoClose !== false) {
      onClose?.();
    }
  };

  return (
    <ModalPortal>
      <OverlayLayer
        variant="viewport"
        scrollable
        onClick={handleBackdropClick}
      >
        <section
          {...rest}
          className={cx(styles.root, className)}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={description || children ? descriptionId : undefined}
        >
          {shouldShowCloseButton && (
            <button
              className={styles.close}
              type="button"
              onClick={onClose}
              aria-label="모달 닫기"
            >
              <X aria-hidden="true" size="1em" />
            </button>
          )}

          <div className={styles.header}>
            <h2 className={styles.title} id={titleId}>
              {title}
            </h2>
          </div>

          {(description || children) && (
            <div className={styles.body} id={descriptionId}>
              {description && <p className={styles.text}>{description}</p>}
              {children && <div className={styles.content}>{children}</div>}
            </div>
          )}

          {actions.length > 0 && (
            <div
              className={cx(
                styles.actions,
                actions.length > 1 && styles['actions--double']
              )}
            >
              {actions.map((action) => (
                <button
                  key={`${action.tone ?? 'primary'}-${action.label}`}
                  className={cx(
                    styles.action,
                    styles[`action--${action.tone ?? 'primary'}`]
                  )}
                  type="button"
                  onClick={() => handleActionClick(action)}
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </section>
      </OverlayLayer>
    </ModalPortal>
  );
};

export default Modal;
