'use client';

import { useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MypageStateContext, MypageStatusContext } from '@/features/profile/context/MypageContext';
import {
  MatchingLoadingContext,
  MatchingStateContext,
} from '@/features/matching/context/MatchingContext';
import MatchingContent from '@/features/matching/components/matching/MatchingContent';
import Loading from '@/shared/components/common/loading/Loading';
import MatchingHeader from '@/features/matching/components/matching/MatchingHeader';
import styles from './MatchingPage.module.scss';

const MatchingPage = () => {
  const state = useContext(MatchingStateContext);
  const userProfile = useContext(MypageStateContext);
  const { isFetching: isUserProfileLoading, isFetchError: isUserProfileError } =
    useContext(MypageStatusContext);
  const isMatchingLoading = useContext(MatchingLoadingContext);
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
        <MatchingContent profileCards={state} />
      )}
    </section>
  );
};

export default MatchingPage;
