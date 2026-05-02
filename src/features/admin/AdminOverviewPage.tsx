'use client';

import {
  useGetOpenReportsQuery,
  useGetPendingPhotosQuery,
  useGetPendingProfilesQuery,
  useGetSuspendedUsersQuery,
} from '@/shared/lib/api/adminApi';
import styles from './AdminOverviewPage.module.scss';

const AdminOverviewPage = () => {
  const { data: pendingProfiles = [], isLoading: isProfilesLoading } =
    useGetPendingProfilesQuery();
  const { data: pendingPhotos = [], isLoading: isPhotosLoading } =
    useGetPendingPhotosQuery();
  const { data: openReports = [], isLoading: isReportsLoading } =
    useGetOpenReportsQuery();
  const { data: suspendedUsers = [], isLoading: isSuspendedLoading } =
    useGetSuspendedUsersQuery();

  return (
    <section className={styles.root} aria-labelledby="admin-overview-title">
      <h2 id="admin-overview-title" className={styles.heading}>
        대시보드
      </h2>
      <ul className={styles.cards}>
        <li className={styles.card}>
          <p className={styles.cardLabel}>검수 대기 프로필</p>
          <p className={styles.cardValue}>
            {isProfilesLoading ? '...' : pendingProfiles.length}
          </p>
        </li>
        <li className={styles.card}>
          <p className={styles.cardLabel}>검수 대기 사진</p>
          <p className={styles.cardValue}>
            {isPhotosLoading ? '...' : pendingPhotos.length}
          </p>
        </li>
        <li className={styles.card}>
          <p className={styles.cardLabel}>처리 대기 신고</p>
          <p className={styles.cardValue}>
            {isReportsLoading ? '...' : openReports.length}
          </p>
        </li>
        <li className={styles.card}>
          <p className={styles.cardLabel}>정지된 사용자</p>
          <p className={styles.cardValue}>
            {isSuspendedLoading ? '...' : suspendedUsers.length}
          </p>
        </li>
      </ul>
      <p className={styles.note}>
        상단 메뉴에서 각 큐로 이동해 검수를 진행해주세요.
      </p>
    </section>
  );
};

export default AdminOverviewPage;
