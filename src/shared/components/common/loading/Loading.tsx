import type { HTMLAttributes } from 'react';
import { cx } from '@/shared/lib/classNames';
import styles from './Loading.module.scss';

interface LoadingProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'page';
}

const Loading = ({ className, variant, ...rest }: LoadingProps) => {
  return (
    <div
      {...rest}
      className={cx(styles.root, variant === 'page' && styles['root--page'], className)}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className={styles.dots} aria-hidden="true">
        <span className={styles.dot} />
        <span className={styles.dot} />
        <span className={styles.dot} />
      </div>
      <span className="sr-only">로딩 중</span>
    </div>
  );
};

export default Loading;
