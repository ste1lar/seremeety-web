import type { ReactNode } from 'react';
import OverlayPortal from '../overlay/OverlayPortal';

interface ModalPortalProps {
  children: ReactNode;
}

const ModalPortal = ({ children }: ModalPortalProps) => <OverlayPortal>{children}</OverlayPortal>;

export default ModalPortal;
