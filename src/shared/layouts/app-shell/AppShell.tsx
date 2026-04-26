import type { ReactNode } from 'react';
import BottomMenu from '@/shared/layouts/bottom-menu/BottomMenu';
import { cx } from '@/shared/lib/classNames';
import styles from './AppShell.module.scss';

interface AppShellProps {
  children: ReactNode;
  showBottomMenu?: boolean;
}

const AppShell = ({ children, showBottomMenu = false }: AppShellProps) => {
  return (
    <div
      className={cx(
        styles.root,
        showBottomMenu && styles['root--with-menu']
      )}
    >
      <main className={styles.content}>{children}</main>
      {showBottomMenu ? <BottomMenu /> : null}
    </div>
  );
};

export default AppShell;
