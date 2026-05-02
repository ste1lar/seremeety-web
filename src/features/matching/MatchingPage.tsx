'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGetMeQuery } from '@/shared/lib/api/profileApi';
import { useGetTodayRecommendationsQuery } from '@/shared/lib/api/recommendationApi';
import MatchingContent from '@/features/matching/components/matching/MatchingContent';
import Loading from '@/shared/components/common/loading/Loading';
import MatchingHeader from '@/features/matching/components/matching/MatchingHeader';
import styles from './MatchingPage.module.scss';

const MatchingPage = () => {
  const {
    data: userProfile,
    isLoading: isUserProfileLoading,
    isError: isUserProfileError,
  } = useGetMeQuery();
  const {
    data: cards = [],
    isLoading: isMatchingLoading,
  } = useGetTodayRecommendationsQuery(undefined, {
    // /matching 진입 시 30초 이상 경과한 캐시면 재페치해 신선한 카드 보장.
    refetchOnMountOrArgChange: 30,
  });
  const router = useRouter();
  const isContentLoading = isUserProfileLoading || isMatchingLoading;

  useEffect(() => {
    if (!isUserProfileLoading && userProfile && userProfile.profileStatus !== 1) {
      router.replace('/my-profile');
    }
  }, [isUserProfileLoading, userProfile, router]);

  return (
    <section className={styles.root} aria-labelledby="matching-heading">
      <MatchingHeader />
      {isUserProfileError ? (
        <p className={styles.error}>
          프로필 정보를 불러오지 못했어요. 잠시 후 다시 시도해주세요.
        </p>
      ) : isContentLoading || !userProfile ? (
        <Loading className={styles.loading} />
      ) : (
        <MatchingContent profileCards={cards} />
      )}
    </section>
  );
};

export default MatchingPage;
