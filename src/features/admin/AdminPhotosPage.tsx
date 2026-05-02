'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ClipboardCheck } from 'lucide-react';
import {
  useApprovePhotoMutation,
  useGetPendingPhotosQuery,
  useRejectPhotoMutation,
} from '@/shared/lib/api/adminApi';
import EmptyState from '@/shared/components/common/empty-state/EmptyState';
import Loading from '@/shared/components/common/loading/Loading';
import sereMeetyLogo from '@/shared/assets/images/seremeety-logo.png';
import type { ProfilePhoto } from '@/shared/types/model/photo';
import styles from './AdminQueuePage.module.scss';

const AdminPhotosPage = () => {
  const { data: photos = [], isLoading } = useGetPendingPhotosQuery();
  const [approvePhoto, { isLoading: isApproving }] = useApprovePhotoMutation();
  const [rejectPhoto, { isLoading: isRejecting }] = useRejectPhotoMutation();
  const isBusy = isApproving || isRejecting;

  if (isLoading) {
    return <Loading />;
  }

  if (photos.length === 0) {
    return (
      <EmptyState icon={ClipboardCheck} message="검수 대기 중인 사진이 없어요" />
    );
  }

  return (
    <section className={styles.root} aria-labelledby="admin-photos-title">
      <h2 id="admin-photos-title" className={styles.heading}>
        사진 검수 ({photos.length})
      </h2>
      <ul className={styles.list}>
        {photos.map((photo) => (
          <PhotoReviewItem
            key={photo.id}
            photo={photo}
            disabled={isBusy}
            onApprove={() => void approvePhoto({ photoId: photo.id })}
            onReject={(reason) => void rejectPhoto({ photoId: photo.id, reason })}
          />
        ))}
      </ul>
    </section>
  );
};

interface PhotoReviewItemProps {
  photo: ProfilePhoto;
  disabled: boolean;
  onApprove: () => void;
  onReject: (reason: string) => void;
}

const PhotoReviewItem = ({
  photo,
  disabled,
  onApprove,
  onReject,
}: PhotoReviewItemProps) => {
  const [imgError, setImgError] = useState(false);
  const [reason, setReason] = useState('');

  return (
    <li className={styles.item}>
      <header className={styles.itemHeader}>
        <strong className={styles.nickname}>사진 #{photo.id.slice(0, 8)}</strong>
        <span className={styles.meta}>
          user: {photo.userId.slice(0, 8)}
          {photo.isMain ? ' · 메인' : ''}
        </span>
      </header>
      <figure className={styles.media}>
        <Image
          alt="검수 대기 사진"
          src={imgError ? sereMeetyLogo.src : photo.displayUrl}
          fill
          sizes="120px"
          className={styles.image}
          onError={() => setImgError(true)}
        />
      </figure>
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

export default AdminPhotosPage;
