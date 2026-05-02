'use client';

import { useEffect } from 'react';
import { Music4, Settings } from 'lucide-react';
import Link from 'next/link';
import { useGetMeQuery } from '@/shared/lib/api/profileApi';
import Loading from '@/shared/components/common/loading/Loading';
import Header from '@/shared/components/common/Header';
import MyProfilePreview from '@/features/profile/components/mypage/MyProfilePreview';
import ProfileStatusBox from '@/features/profile/components/mypage/ProfileStatusBox';
import type { ProfileStats, UserProfile } from '@/shared/types/domain';
import styles from './MypagePage.module.scss';

const getProfileStats = (userProfile: UserProfile): ProfileStats => ({
  hasProfileImage: Boolean(userProfile.profilePictureUrl),
  introLength: userProfile.introduce.trim().length,
  hasSelso: false,
  requestsReceived: 0,
  profileRating: 'Shine',
});

const MypagePage = () => {
  const { data: userProfile, isLoading: isFetching } = useGetMeQuery();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  return (
    <section className={styles.root} aria-labelledby="mypage-title">
      <Header
        variant="mypage"
        title="MYPAGE"
        titleId="mypage-title"
        headingLevel="h1"
        menuAriaLabel="마이페이지 메뉴"
        menu={
          <>
            {userProfile && (
              <Link href="/shop" aria-label={`상점 이동 (보유 음표: ${userProfile.coin})`}>
                <Music4 aria-hidden="true" size="1em" />
                {userProfile.coin}
              </Link>
            )}
            <Link
              aria-label="설정"
              href="/setting"
            >
              <Settings aria-hidden="true" size="1em" />
            </Link>
          </>
        }
      />

      <div className={styles.content}>
        {isFetching || !userProfile ? (
          <Loading className={styles.loading} />
        ) : (
          <>
            <MyProfilePreview userProfile={userProfile} />
            <ProfileStatusBox stats={getProfileStats(userProfile)} />
          </>
        )}
      </div>
    </section>
  );
};

export default MypagePage;
