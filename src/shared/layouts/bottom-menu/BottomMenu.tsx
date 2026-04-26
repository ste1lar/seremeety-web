'use client';

import { useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { menuItems } from '@/shared/lib/constants';
import MenuItem from './MenuItem';
import styles from './BottomMenu.module.scss';

const BottomMenu = () => {
  const pathname = usePathname();

  const isSelected = useCallback(
    (route: string) => {
      if (!route) return false;
      if (route === '/') return pathname === route;
      return pathname.startsWith(route) && pathname !== '/';
    },
    [pathname]
  );

  return (
    <nav className={styles.root} aria-label="주요 메뉴">
      {menuItems.map((item) => (
        <MenuItem
          key={item.dataRoute}
          {...item}
          isSelected={isSelected(item.dataRoute)}
        />
      ))}
    </nav>
  );
};

export default BottomMenu;
