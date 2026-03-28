'use client';

import { useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { menuItems } from '@/shared/lib/constants';
import MenuItem from './MenuItem';
import type { MouseEvent } from 'react';

const BottomMenu = () => {
  const router = useRouter();
  const pathname = usePathname();

  const isSelected = useCallback(
    (route: string) => {
      if (!route) return false;
      if (route === '/') return pathname === route;
      return pathname.startsWith(route) && pathname !== '/';
    },
    [pathname]
  );

  const handleMenuClick = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      const route = e.currentTarget.getAttribute('data-route');
      if (route) {
        router.push(route);
      }
    },
    [router]
  );

  return (
    <nav className="bottom-menu" aria-label="Primary">
      {menuItems.map((item) => (
        <MenuItem
          key={item.dataRoute}
          {...item}
          isSelected={isSelected(item.dataRoute)}
          onClick={handleMenuClick}
        />
      ))}
    </nav>
  );
};

export default BottomMenu;
