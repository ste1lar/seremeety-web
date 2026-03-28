'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface OverlayPortalProps {
  children: ReactNode;
}

const OverlayPortal = ({ children }: OverlayPortalProps) => {
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setPortalTarget(document.body);
  }, []);

  if (!portalTarget) {
    return null;
  }

  return createPortal(children, portalTarget);
};

export default OverlayPortal;
