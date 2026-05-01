import type { ReactNode } from 'react';
import styles from './PageTransition.module.scss';

interface PageTransitionProps {
  children: ReactNode;
  // 호환성을 위해 prop은 유지하되 무시. 페이지 전환 애니메이션은 제거됨.
  direction?: 'x' | 'y';
}

const PageTransition = ({ children }: PageTransitionProps) => (
  <div className={styles.root}>{children}</div>
);

export default PageTransition;
