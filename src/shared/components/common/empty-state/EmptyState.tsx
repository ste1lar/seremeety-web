import React from 'react';
import { CircleX, type LucideIcon } from 'lucide-react';
import styles from './EmptyState.module.scss';

interface EmptyStateProps {
  icon?: LucideIcon;
  message?: string;
}

const EmptyState = ({ icon: Icon = CircleX, message }: EmptyStateProps) => {
  return (
    <div className={styles.root}>
      <Icon aria-hidden="true" className={styles.icon} size="1em" />
      {message && <p className={styles.message}>{message}</p>}
    </div>
  );
};

export default React.memo(EmptyState);
