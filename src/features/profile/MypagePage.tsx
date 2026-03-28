'use client';

import { useContext, useEffect } from 'react';
import { Music4, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { MypageStateContext, MypageStatusContext } from '@/features/profile/context/MypageContext';
import Loading from '@/shared/components/common/loading/Loading';
import Header from '@/shared/components/common/Header';
import MyProfilePreview from '@/features/profile/components/mypage/MyProfilePreview';
import ProfileStatusBox from '@/features/profile/components/mypage/ProfileStatusBox';
import type { ProfileStats, UserProfile } from '@/shared/types/domain';

const getProfileStats = (userProfile: UserProfile): ProfileStats => ({
  hasProfileImage: Boolean(userProfile.profilePictureUrl),
  introLength: userProfile.introduce.trim().length,
  hasSelso: false,
  requestsReceived: 0,
  profileRating: 'Shine',
});

const MypagePage = () => {
  const userProfile = useContext(MypageStateContext);
  const { isFetching } = useContext(MypageStatusContext);
  const router = useRouter();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  return (
    <section className="mypage" aria-labelledby="mypage-title">
      <Header
        variant="mypage"
        title="MYPAGE"
        titleId="mypage-title"
        headingLevel="h1"
        menuAriaLabel="마이페이지 메뉴"
        menu={
          <>
            {userProfile && (
              <button className="header__note" type="button" onClick={() => router.push('/shop')}>
                <Music4 aria-hidden="true" size="1em" />
                {userProfile.coin}
              </button>
            )}
            <button
              className="header__setting"
              type="button"
              aria-label="설정"
              onClick={() => router.push('/setting')}
            >
              <Settings aria-hidden="true" size="1em" />
            </button>
          </>
        }
      />

      <div className="mypage-content">
        {isFetching || !userProfile ? (
          <Loading className="mypage-content__loading" />
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
