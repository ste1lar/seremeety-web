import { Sparkles } from 'lucide-react';
import ProfileCardItem from './ProfileCardItem';
import EmptyState from '@/shared/components/common/empty-state/EmptyState';
import type { UserProfile } from '@/shared/types/domain';
import styles from './MatchingContent.module.scss';

interface MatchingContentProps {
  profileCards: UserProfile[];
}

const MatchingContent = ({ profileCards }: MatchingContentProps) => {
  if (profileCards.length === 0) {
    return (
      <div className={styles.root}>
        <EmptyState
          icon={Sparkles}
          message="오늘의 추천을 모두 확인했어요. 내일 다시 와주세요"
        />
      </div>
    );
  }

  return (
    <div className={styles.root}>
      <p className={styles.summary}>오늘의 추천 {profileCards.length}장</p>
      <ul className={styles.grid}>
        {profileCards.map((it) => (
          <li className={styles.card} key={it.uid ?? `${it.nickname}-${it.age}`}>
            <ProfileCardItem {...it} profileStatus={1} />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MatchingContent;
