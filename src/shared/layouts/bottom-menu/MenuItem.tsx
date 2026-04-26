import React from 'react';
import type { LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { cx } from '@/shared/lib/classNames';
import styles from './MenuItem.module.scss';

interface MenuItemProps {
  icon: LucideIcon;
  dataRoute: string;
  label: string;
  isSelected: boolean;
}

const MenuItem = ({ icon: Icon, dataRoute, label, isSelected }: MenuItemProps) => {
  return (
    <Link
      className={cx(styles.root, isSelected && styles['root--selected'])}
      href={dataRoute}
      aria-current={isSelected ? 'page' : undefined}
    >
      <Icon aria-hidden="true" size="1em" />
      <span className={styles.label}>{label}</span>
    </Link>
  );
};

export default React.memo(MenuItem);
