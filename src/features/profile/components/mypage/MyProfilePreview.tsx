import { useEffect, useState } from 'react';
import { Cake, ChevronRight, Heart, Navigation } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import sereMeetyLogo from '@/shared/assets/images/seremeety-logo.png';
import Button from '@/shared/components/common/button/Button';
import { auth } from '@/firebase';
import Modal, { type ModalConfig } from '@/shared/components/common/modal/Modal';
import type { UserProfile } from '@/shared/types/domain';
import styles from './MyProfilePreview.module.scss';

interface MyProfilePreviewProps {
  userProfile: UserProfile;
}

const MyProfilePreview = ({ userProfile }: MyProfilePreviewProps) => {
  const [imgError, setImgError] = useState(false);
  const [modal, setModal] = useState<ModalConfig | null>(null);
  const currentUserUid = auth.currentUser?.uid;
  const previewHref = currentUserUid ? `/profile/${currentUserUid}?viewOnly=1` : '#';

  useEffect(() => {
    setImgError(false);
  }, [userProfile.profilePictureUrl]);

  const handleMakeSelso = () => {
    setModal({
      actions: [{ label: '확인' }],
      closeOnBackdrop: false,
      description: '준비 중인 기능이에요',
      showCloseButton: false,
      title: '셀소 만들기',
    });
  };

  const infoItems = [
    { icon: Cake, label: '나이', value: userProfile.age },
    { icon: Heart, label: 'MBTI', value: userProfile.mbti },
    { icon: Navigation, label: '지역', value: userProfile.place },
  ];

  return (
    <article className={styles.root} aria-labelledby="my-profile-preview-title">
      <h2 className="sr-only" id="my-profile-preview-title">
        내 프로필 요약
      </h2>

      <div className={styles.preview}>
        <figure className={styles.left}>
          <div className={styles['image-wrapper']}>
            <Image
              alt={`${userProfile.nickname} 프로필 사진`}
              src={imgError ? sereMeetyLogo.src : userProfile.profilePictureUrl}
              fill
              loading="eager"
              sizes="96px"
              onError={() => setImgError(true)}
            />
          </div>
          <figcaption className={styles.nickname}>{userProfile.nickname}</figcaption>
        </figure>

        <div className={styles.right}>
          <dl className={styles.stats}>
            {infoItems.map((item) => {
              const ItemIcon = item.icon;

              return (
                <div className={styles.stat} key={item.label}>
                  <dt className={styles['stat-label']}>
                    <ItemIcon aria-hidden="true" size="1em" />
                    <span className="sr-only">{item.label}</span>
                  </dt>
                  <dd className={styles['stat-value']}>{item.value}</dd>
                </div>
              );
            })}
          </dl>
          {currentUserUid ? (
            <Link className={styles['preview-link']} href={previewHref}>
              미리보기
              <ChevronRight aria-hidden="true" size="1em" />
            </Link>
          ) : (
            <span className={styles['preview-link']} aria-disabled="true">
              미리보기
              <ChevronRight aria-hidden="true" size="1em" />
            </span>
          )}
        </div>
      </div>

      <div className={styles.actions}>
        <Button text="프로필 수정" href="/my-profile" />
        <Button text="셀소 만들기" onClick={handleMakeSelso} />
      </div>
      <p className={styles.note}>
        셀소를 등록하면 프로필이 DISCOVER에 24시간 동안 우선 노출돼요.
      </p>
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
    </article>
  );
};

export default MyProfilePreview;
