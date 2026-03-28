'use client';

import { useCallback, useContext, useEffect, useState } from 'react';
import { GraduationCap, Heart, Mars, Navigation, UserRound, Venus } from 'lucide-react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import PageTransition from '@/shared/components/common/PageTransition';
import Loading from '@/shared/components/common/loading/Loading';
import Header from '@/shared/components/common/Header';
import {
  MypageDispatchContext,
  MypageStateContext,
  MypageStatusContext,
} from '@/features/profile/context/MypageContext';
import { RequestDispatchContext } from '@/features/request/context/RequestContext';
import Button from '@/shared/components/common/button/Button';
import ImageLoading from '@/shared/components/common/image-loading/ImageLoading';
import Modal, { type ModalConfig } from '@/shared/components/common/modal/Modal';
import { auth } from '@/firebase';
import { getUserDataByUid } from '@/shared/lib/firebase/users';
import { isRequestExist } from '@/shared/lib/firebase/requests';
import type { UserProfile } from '@/shared/types/domain';

const ProfilePage = () => {
  const [modal, setModal] = useState<ModalConfig | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const { uid } = useParams<{ uid: string }>();
  const searchParams = useSearchParams();
  const state = useContext(MypageStateContext);
  const { isFetching: isMypageFetching } = useContext(MypageStatusContext);
  const { onUpdateCoin } = useContext(MypageDispatchContext);
  const { onCreate } = useContext(RequestDispatchContext);
  const router = useRouter();
  const isViewOnly = searchParams.get('viewOnly') === '1';
  const [isImgLoaded, setIsImgLoaded] = useState(false);
  const [isProfileLoading, setIsProfileLoading] = useState(true);

  const openAlert = useCallback(
    (title: string, description: string, onConfirm?: () => void) => {
      setModal({
        actions: [{ label: '확인', onClick: onConfirm }],
        closeOnBackdrop: false,
        description,
        showCloseButton: false,
        title,
      });
    },
    []
  );

  useEffect(() => {
    if (!uid || Array.isArray(uid)) {
      setIsProfileLoading(false);
      return;
    }

    if (!state || !uid || Array.isArray(uid)) {
      return;
    }

    if (state.profileStatus === undefined) {
      return;
    }
    if (state.profileStatus !== 1) {
      setIsProfileLoading(false);
      openAlert('프로필 열람', '먼저 프로필을 완성해주세요', () => router.replace('/my-profile'));
      return;
    }

    let isMounted = true;

    const fetchUserProfile = async () => {
      setIsProfileLoading(true);

      try {
        const userData = await getUserDataByUid(uid);
        if (userData && isMounted) {
          setUserProfile(userData);
        } else {
          openAlert('오류', '존재하지 않는 프로필입니다', () => router.back());
        }
      } catch (error) {
        console.error(error);
      } finally {
        if (isMounted) {
          setIsProfileLoading(false);
        }
      }
    };

    void fetchUserProfile();

    return () => {
      isMounted = false;
    };
  }, [openAlert, router, state, uid]);

  useEffect(() => {
    setIsImgLoaded(false);
  }, [userProfile?.profilePictureUrl]);

  const submitRequest = async () => {
    const currentUserUid = auth.currentUser?.uid;
    if (!currentUserUid || !state || !uid || Array.isArray(uid)) {
      return;
    }

    try {
      if (!(await isRequestExist(currentUserUid, uid))) {
        if (state.coin < 10) {
          setModal({
            actions: [
              { label: '취소', tone: 'secondary' },
              { label: '확인', onClick: () => router.push('/shop') },
            ],
            closeOnBackdrop: true,
            description: '음표가 부족해요 상점으로 이동할까요?',
            showCloseButton: true,
            title: '음표 부족',
          });
          return;
        }

        await onCreate(currentUserUid, uid);
        await onUpdateCoin({ ...state, coin: state.coin - 10 });
        openAlert('매칭 요청', '성공적으로 전송되었어요!');
        return;
      }

      openAlert('매칭 요청', '이미 보내셨거나 받으신 요청이 있어요');
    } catch (error) {
      console.error(error);
    }
  };

  const handleRequestClick = () => {
    setModal({
      actions: [
        { label: '취소', tone: 'secondary' },
        { label: '확인', onClick: () => void submitRequest() },
      ],
      closeOnBackdrop: true,
      description: '요청을 보내시겠어요? · 10음표',
      showCloseButton: true,
      title: '매칭 요청',
    });
  };

  const modalElement = (
    <Modal
      open={modal !== null}
      title={modal?.title ?? ''}
      description={modal?.description}
      actions={modal?.actions}
      closeOnBackdrop={modal?.closeOnBackdrop}
      showCloseButton={modal?.showCloseButton}
      onClose={() => setModal(null)}
    >
      {modal?.children}
    </Modal>
  );

  const isContentLoading = isMypageFetching || isProfileLoading;
  const GenderIcon = userProfile?.gender === 'male' ? Mars : Venus;

  return (
    <PageTransition>
      <section className="profile" aria-labelledby="profile-title">
        <Header
          variant="profile"
          title="PROFILE"
          titleId="profile-title"
          headingLevel="h1"
          showBackButton
        />

        <article className="profile-content">
          {isContentLoading ? (
            <Loading className="profile-content__loading" />
          ) : (
            userProfile && (
              <>
                <figure className="profile-content__media">
                  {!isImgLoaded && <ImageLoading borderRadius="0.3125rem" />}
                  <img
                    alt={`${userProfile.nickname} 프로필 사진`}
                    src={userProfile.profilePictureUrl}
                    onLoad={() => setIsImgLoaded(true)}
                    className={[
                      'profile-content__img',
                      !isImgLoaded && 'profile-content__img--hidden',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  />
                </figure>

                <header className="profile-content__info-upper">
                  <h2 className="profile-content__nickname">{userProfile.nickname}</h2>
                  <p className="profile-content__age-gender">
                    {userProfile.age}
                    <GenderIcon
                      aria-hidden="true"
                      className={`profile-content__gender-icon ${userProfile.gender}`}
                      size="1em"
                    />
                  </p>
                </header>

                <ul className="profile-content__info-list">
                  <li className="profile-content__info">
                    <Heart aria-hidden="true" size="1em" />
                    {userProfile.mbti}
                  </li>
                  <li className="profile-content__info">
                    <GraduationCap aria-hidden="true" size="1em" />
                    {userProfile.university}
                  </li>
                  <li className="profile-content__info">
                    <Navigation aria-hidden="true" size="1em" />
                    {userProfile.place}
                  </li>
                </ul>

                <section className="profile-content__intro" aria-labelledby="profile-intro-title">
                  <h3 className="profile-content__intro-label" id="profile-intro-title">
                    <UserRound aria-hidden="true" size="1em" />
                    자기소개
                  </h3>
                  <p className="profile-content__intro-text">{userProfile.introduce}</p>
                </section>

                {!isViewOnly && (
                  <footer className="profile-content__actions">
                    <Button text="매칭 요청" onClick={() => void handleRequestClick()} />
                  </footer>
                )}
              </>
            )
          )}
        </article>
      </section>
      {modalElement}
    </PageTransition>
  );
};

export default ProfilePage;
