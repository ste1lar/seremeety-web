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
      <OverlayLayer className="common-modal-layer" variant="viewport" scrollable onClick={handleBackdropClick}>
        <section
          {...rest}
          className={['common-modal', className].filter(Boolean).join(' ')}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={description || children ? descriptionId : undefined}
        >
          {shouldShowCloseButton && (
            <button
              className="common-modal__close"
              type="button"
              onClick={onClose}
              aria-label="모달 닫기"
            >
              <X aria-hidden="true" size="1em" />
            </button>
          )}

          <div className="common-modal__header">
            <h2 className="common-modal__title" id={titleId}>
              {title}
            </h2>
          </div>

          {(description || children) && (
            <div className="common-modal__body" id={descriptionId}>
              {description && <p className="common-modal__text">{description}</p>}
              {children && <div className="common-modal__content">{children}</div>}
            </div>
          )}

          {actions.length > 0 && (
            <div
              className={[
                'common-modal__actions',
                actions.length > 1 && 'common-modal__actions--double',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {actions.map((action) => (
                <button
                  key={`${action.tone ?? 'primary'}-${action.label}`}
                  className={[
                    'common-modal__action',
                    `common-modal__action--${action.tone ?? 'primary'}`,
                  ].join(' ')}
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
