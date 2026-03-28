import type { HTMLAttributes, ReactNode } from 'react';

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
      className={[
        'common-overlay-layer',
        `common-overlay-layer--${variant}`,
        scrollable && 'common-overlay-layer--scrollable',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </div>
  );
};

export default OverlayLayer;
