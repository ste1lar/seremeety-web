import type { ReactNode } from 'react';
import BottomMenu from '@/shared/layouts/bottom-menu/BottomMenu';

interface AppShellProps {
  children: ReactNode;
  showBottomMenu?: boolean;
}

const AppShell = ({ children, showBottomMenu = false }: AppShellProps) => {
  return (
    <div className={`app-shell${showBottomMenu ? ' app-shell--with-bottom-menu' : ''}`}>
      <main className="app-shell__content">{children}</main>
      {showBottomMenu ? <BottomMenu /> : null}
    </div>
  );
};

export default AppShell;
