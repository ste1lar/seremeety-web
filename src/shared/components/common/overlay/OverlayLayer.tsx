import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '@/shared/lib/classNames';
import styles from './OverlayLayer.module.scss';

interface OverlayLayerProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  scrollable?: boolean;
  variant?: 'viewport';
}

const OverlayLayer = ({
  children,
  className,
  scrollable = false,
  variant = 'viewport',
  ...rest
}: OverlayLayerProps) => {
  return (
    <div
      {...rest}
      className={cx(
        styles.root,
        styles[`root--${variant}`],
        scrollable && styles['root--scrollable'],
        className
      )}
    >
      {children}
    </div>
  );
};

export default OverlayLayer;
