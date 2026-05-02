'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { cx } from '@/shared/lib/classNames';
import styles from './AdminLayout.module.scss';

interface AdminLayoutProps {
  children: ReactNode;
}

const NAV_ITEMS = [
  { href: '/admin', label: 'OVERVIEW' },
  { href: '/admin/profiles', label: '프로필 검수' },
  { href: '/admin/photos', label: '사진 검수' },
  { href: '/admin/reports', label: '신고' },
  { href: '/admin/users', label: '사용자' },
];

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const pathname = usePathname();

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <h1 className={styles.title}>ADMIN</h1>
        <nav className={styles.nav} aria-label="관리자 메뉴">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cx(
                styles.navItem,
                pathname === item.href && styles['navItem--active']
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className={styles.main}>{children}</main>
    </div>
  );
};

export default AdminLayout;
