'use client';

import { useCallback, useContext, useEffect, useState } from 'react';
import {
  GraduationCap,
  Heart,
  Mars,
  Navigation,
  UserRound,
  UserX,
  Venus,
} from 'lucide-react';
import Image from 'next/image';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import sereMeetyLogo from '@/shared/assets/images/seremeety-logo.png';
import PageTransition from '@/shared/components/common/PageTransition';
import Loading from '@/shared/components/common/loading/Loading';
import Header from '@/shared/components/common/Header';
import {
  MypageStateContext,
  MypageStatusContext,
} from '@/features/profile/context/MypageContext';
import Button from '@/shared/components/common/button/Button';
import Modal, { type ModalConfig } from '@/shared/components/common/modal/Modal';
import { auth } from '@/firebase';
import { getUserDataByUid } from '@/shared/lib/firebase/users';
import { getProfilePhotosByUserId } from '@/shared/lib/firebase/profilePhotos';
import {
  createReaction,
  getReaction,
} from '@/shared/lib/firebase/reactions';
import {
  createMatch,
  getActiveMatchByUsers,
} from '@/shared/lib/firebase/matches';
import { writeMatchToLegacyChatRoom } from '@/shared/lib/firebase/legacyBridge';
import { createBlock, getBlockedUserIds } from '@/shared/lib/firebase/blocks';
import { getEntitlementByUserId } from '@/shared/lib/firebase/entitlements';
import {
  countLikesToday,
  countSuperLikesToday,
} from '@/shared/lib/firebase/dailyLimits';
import { markRecommendationReacted } from '@/shared/lib/firebase/recommendationLogs';
import { cx } from '@/shared/lib/classNames';
import type { ProfilePhoto } from '@/shared/types/model/photo';
import type { ReactionType } from '@/shared/types/model/reaction';
import type { UserProfile } from '@/shared/types/domain';
import styles from './ProfilePage.module.scss';

const ProfilePage = () => {
  const [modal, setModal] = useState<ModalConfig | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const { uid } = useParams<{ uid: string }>();
  const searchParams = useSearchParams();
  const state = useContext(MypageStateContext);
  const { isFetching: isMypageFetching } = useContext(MypageStatusContext);
  const router = useRouter();
  const isViewOnly = searchParams.get('viewOnly') === '1';
  const [imgError, setImgError] = useState(false);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [extraPhotos, setExtraPhotos] = useState<ProfilePhoto[]>([]);
  const [myReactionType, setMyReactionType] = useState<ReactionType | null>(null);
  const [isAlreadyMatched, setIsAlreadyMatched] = useState(false);
  const [isReacting, setIsReacting] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);

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
    setImgError(false);
  }, [userProfile?.profilePictureUrl]);

  // 다중 사진 fetch — 승인된 사진만, 메인은 제외 (메인은 위 큰 카드로 표시).
  useEffect(() => {
    if (!uid || Array.isArray(uid) || !userProfile) {
      return;
    }
    const load = async () => {
      try {
        const photos = await getProfilePhotosByUserId(uid);
        setExtraPhotos(
          photos.filter((p) => !p.isMain && p.status === 'approved')
        );
      } catch (err) {
        console.error(err);
      }
    };
    void load();
  }, [uid, userProfile]);

  // 내가 이 프로필에 이미 반응했는지, 매칭됐는지, 차단했는지 로드.
  useEffect(() => {
    const currentUserUid = auth.currentUser?.uid;
    if (!currentUserUid || !uid || Array.isArray(uid) || isViewOnly) {
      return;
    }
    const load = async () => {
      try {
        const [reaction, match, blockedSet] = await Promise.all([
          getReaction(currentUserUid, uid),
          getActiveMatchByUsers(currentUserUid, uid),
          getBlockedUserIds(currentUserUid),
        ]);
        setMyReactionType(reaction?.type ?? null);
        setIsAlreadyMatched(match !== null);
        setIsBlocked(blockedSet.has(uid));
      } catch (error) {
        console.error(error);
      }
    };
    void load();
  }, [uid, isViewOnly]);

  // TODO(Phase 3): Functions로 이동. mutual like 검증, daily limit 체크, match 생성을 서버에서.
  const handleReact = async (type: ReactionType) => {
    const currentUserUid = auth.currentUser?.uid;
    if (!currentUserUid || !uid || Array.isArray(uid) || isReacting) {
      return;
    }
    setIsReacting(true);
    try {
      // 좋아요/슈퍼좋아요는 daily limit 체크. pass는 무제한.
      if (type === 'like' || type === 'superLike') {
        const entitlement = await getEntitlementByUserId(currentUserUid);
        const limit =
          type === 'like'
            ? entitlement?.dailyLikeLimit ?? 3
            : entitlement?.dailySuperLikeLimit ?? 0;
        const used =
          type === 'like'
            ? await countLikesToday(currentUserUid)
            : await countSuperLikesToday(currentUserUid);
        if (used >= limit) {
          openAlert(
            type === 'like' ? '좋아요 한도' : '슈퍼좋아요 한도',
            '오늘의 한도를 모두 사용했어요. 내일 다시 시도해주세요'
          );
          return;
        }
      }

      const myReactionId = await createReaction(currentUserUid, uid, type);
      setMyReactionType(type);
      void markRecommendationReacted(currentUserUid, uid, type);

      if (type === 'like' || type === 'superLike') {
        const theirReaction = await getReaction(uid, currentUserUid);
        if (theirReaction?.type === 'like' || theirReaction?.type === 'superLike') {
          await createMatch(currentUserUid, uid, [
            myReactionId,
            theirReaction.id,
          ]);
          await writeMatchToLegacyChatRoom(currentUserUid, uid);
          setIsAlreadyMatched(true);
          setModal({
            actions: [
              { label: '계속 둘러보기', tone: 'secondary' },
              { label: '채팅으로', onClick: () => router.push('/chat-list') },
            ],
            closeOnBackdrop: true,
            showCloseButton: true,
            title: '매칭 성공',
            description: '서로 좋아요를 보내 매칭되었어요!',
          });
          return;
        }
        openAlert('좋아요 전송', '상대방도 좋아요를 보내면 매칭이 돼요');
        return;
      }
      // pass: 별도 모달 없이 뒤로 이동.
      router.back();
    } catch (error) {
      console.error(error);
      openAlert('오류', '처리 중 오류가 발생했어요');
    } finally {
      setIsReacting(false);
    }
  };

  const performBlock = async () => {
    const currentUserUid = auth.currentUser?.uid;
    if (!currentUserUid || !uid || Array.isArray(uid)) return;
    try {
      await createBlock(currentUserUid, uid);
      setIsBlocked(true);
      openAlert('차단 완료', '해당 사용자가 추천에서 제외됩니다', () =>
        router.replace('/matching')
      );
    } catch (error) {
      console.error(error);
      openAlert('오류', '차단 중 오류가 발생했어요');
    }
  };

  const handleBlockClick = () => {
    setModal({
      actions: [
        { label: '취소', tone: 'secondary' },
        { label: '차단', onClick: () => void performBlock() },
      ],
      closeOnBackdrop: true,
      showCloseButton: true,
      title: '사용자 차단',
      description: '서로 추천/매칭에서 제외돼요. 진행할까요?',
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
      <section className={styles.root} aria-labelledby="profile-title">
        <Header
          variant="profile"
          title="PROFILE"
          titleId="profile-title"
          headingLevel="h1"
          showBackButton
          menuAriaLabel="프로필 메뉴"
          menu={
            !isViewOnly && userProfile && !isBlocked ? (
              <button
                type="button"
                onClick={handleBlockClick}
                aria-label="이 사용자 차단"
              >
                <UserX aria-hidden="true" size="1em" />
              </button>
            ) : undefined
          }
        />

        <article className={styles.content}>
          {isContentLoading ? (
            <Loading className={styles.loading} />
          ) : (
            userProfile && (
              <>
                <figure className={styles.media}>
                  <Image
                    alt={`${userProfile.nickname} 프로필 사진`}
                    src={imgError ? sereMeetyLogo.src : userProfile.profilePictureUrl}
                    fill
                    priority
                    sizes="(max-width: 480px) calc(100vw - 3rem), 432px"
                    onError={() => setImgError(true)}
                    className={styles.image}
                  />
                </figure>

                {extraPhotos.length > 0 && (
                  <div
                    className={styles['extra-photos']}
                    aria-label={`${userProfile.nickname}님의 추가 사진`}
                  >
                    {extraPhotos.map((photo) => (
                      <ExtraPhotoThumb key={photo.id} photo={photo} />
                    ))}
                  </div>
                )}

                <header className={styles['info-header']}>
                  <h2 className={styles.nickname}>{userProfile.nickname}</h2>
                  <p className={styles.meta}>
                    {userProfile.age}
                    <GenderIcon
                      aria-hidden="true"
                      className={cx(
                        styles['gender-icon'],
                        styles[userProfile.gender]
                      )}
                      size="1em"
                    />
                  </p>
                </header>

                <ul className={styles['info-list']}>
                  <li className={styles.info}>
                    <Heart aria-hidden="true" size="1em" />
                    {userProfile.mbti}
                  </li>
                  <li className={styles.info}>
                    <GraduationCap aria-hidden="true" size="1em" />
                    {userProfile.university}
                  </li>
                  <li className={styles.info}>
                    <Navigation aria-hidden="true" size="1em" />
                    {userProfile.place}
                  </li>
                </ul>

                <section className={styles.intro} aria-labelledby="profile-intro-title">
                  <h3 className={styles['intro-heading']} id="profile-intro-title">
                    <UserRound aria-hidden="true" size="1em" />
                    자기소개
                  </h3>
                  <p className={styles['intro-text']}>{userProfile.introduce}</p>
                </section>

                {!isViewOnly && (
                  <footer className={styles.actions}>
                    {isAlreadyMatched ? (
                      <Button
                        text="채팅으로 이동"
                        onClick={() => router.push('/chat-list')}
                      />
                    ) : myReactionType === 'like' ? (
                      <Button text="좋아요 보냄" disabled />
                    ) : myReactionType === 'pass' ? (
                      <Button text="패스함" disabled />
                    ) : (
                      <>
                        <Button
                          text="패스"
                          type="light"
                          onClick={() => void handleReact('pass')}
                          disabled={isReacting}
                        />
                        <Button
                          text="좋아요"
                          onClick={() => void handleReact('like')}
                          disabled={isReacting}
                        />
                      </>
                    )}
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

interface ExtraPhotoThumbProps {
  photo: ProfilePhoto;
}

const ExtraPhotoThumb = ({ photo }: ExtraPhotoThumbProps) => {
  const [thumbError, setThumbError] = useState(false);
  return (
    <figure className={styles['extra-photo']}>
      <Image
        alt="추가 프로필 사진"
        src={thumbError ? sereMeetyLogo.src : photo.displayUrl}
        fill
        sizes="160px"
        loading="eager"
        className={styles.image}
        onError={() => setThumbError(true)}
      />
    </figure>
  );
};

export default ProfilePage;
