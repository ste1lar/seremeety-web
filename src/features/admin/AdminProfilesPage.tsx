'use client';

import { useState } from 'react';
import {
  useApproveProfileMutation,
  useGetPendingProfilesQuery,
  useRejectProfileMutation,
} from '@/shared/lib/api/adminApi';
import EmptyState from '@/shared/components/common/empty-state/EmptyState';
import Loading from '@/shared/components/common/loading/Loading';
import { ClipboardCheck } from 'lucide-react';
import type { Profile } from '@/shared/types/model/profile';
import styles from './AdminQueuePage.module.scss';

const AdminProfilesPage = () => {
  const { data: profiles = [], isLoading } = useGetPendingProfilesQuery();
  const [approveProfile, { isLoading: isApproving }] = useApproveProfileMutation();
  const [rejectProfile, { isLoading: isRejecting }] = useRejectProfileMutation();
  const isBusy = isApproving || isRejecting;

  if (isLoading) {
    return <Loading />;
  }

  if (profiles.length === 0) {
    return (
      <EmptyState icon={ClipboardCheck} message="검수 대기 중인 프로필이 없어요" />
    );
  }

  return (
    <section className={styles.root} aria-labelledby="admin-profiles-title">
      <h2 id="admin-profiles-title" className={styles.heading}>
        프로필 검수 ({profiles.length})
      </h2>
      <ul className={styles.list}>
        {profiles.map((profile) => (
          <ProfileReviewItem
            key={profile.id}
            profile={profile}
            disabled={isBusy}
            onApprove={() =>
              void approveProfile({ profileId: profile.id, userId: profile.userId })
            }
            onReject={(reason) =>
              void rejectProfile({
                profileId: profile.id,
                userId: profile.userId,
                reason,
              })
            }
          />
        ))}
      </ul>
    </section>
  );
};

interface ProfileReviewItemProps {
  profile: Profile;
  disabled: boolean;
  onApprove: () => void;
  onReject: (reason: string) => void;
}

const ProfileReviewItem = ({
  profile,
  disabled,
  onApprove,
  onReject,
}: ProfileReviewItemProps) => {
  const [reason, setReason] = useState('');

  return (
    <li className={styles.item}>
      <header className={styles.itemHeader}>
        <strong className={styles.nickname}>{profile.nickname}</strong>
        <span className={styles.meta}>
          {profile.gender} · {profile.birthYear}년생 · {profile.location}
        </span>
      </header>
      {profile.bio && <p className={styles.bio}>{profile.bio}</p>}
      <dl className={styles.fields}>
        {profile.mbti && (
          <>
            <dt>MBTI</dt>
            <dd>{profile.mbti}</dd>
          </>
        )}
        {profile.university && (
          <>
            <dt>학교</dt>
            <dd>{profile.university}</dd>
          </>
        )}
      </dl>
      <div className={styles.actions}>
        <input
          type="text"
          placeholder="반려 사유 (반려 시)"
          className={styles.reason}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          disabled={disabled}
        />
        <button
          type="button"
          className={styles.reject}
          onClick={() => onReject(reason)}
          disabled={disabled || !reason.trim()}
        >
          반려
        </button>
        <button
          type="button"
          className={styles.approve}
          onClick={onApprove}
          disabled={disabled}
        >
          승인
        </button>
      </div>
    </li>
  );
};

export default AdminProfilesPage;
