import { useEffect, useState, type MouseEvent } from 'react';
import { Cake, ChevronRight, Heart, Navigation } from 'lucide-react';
import { useRouter } from 'next/navigation';
import ImageLoading from '@/shared/components/common/image-loading/ImageLoading';
import Button from '@/shared/components/common/button/Button';
import { auth } from '@/firebase';
import Modal, { type ModalConfig } from '@/shared/components/common/modal/Modal';
import type { UserProfile } from '@/shared/types/domain';

interface MyProfilePreviewProps {
  userProfile: UserProfile;
}

const MyProfilePreview = ({ userProfile }: MyProfilePreviewProps) => {
  const [isImgLoaded, setIsImgLoaded] = useState(false);
  const [modal, setModal] = useState<ModalConfig | null>(null);
  const router = useRouter();
  const currentUserUid = auth.currentUser?.uid;
  const previewHref = currentUserUid ? `/profile/${currentUserUid}?viewOnly=1` : '#';

  useEffect(() => {
    setIsImgLoaded(false);
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

  const handlePreviewClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();

    if (!currentUserUid) {
      return;
    }

    router.push(previewHref);
  };

  const infoItems = [
    { icon: Cake, label: '나이', value: userProfile.age },
    { icon: Heart, label: 'MBTI', value: userProfile.mbti },
    { icon: Navigation, label: '지역', value: userProfile.place },
  ];

  return (
    <article className="my-profile-preview" aria-labelledby="my-profile-preview-title">
      <h2 className="sr-only" id="my-profile-preview-title">
        내 프로필 요약
      </h2>

      <div className="my-profile-preview__preview">
        <figure className="my-profile-preview__left">
          <div className="my-profile-preview__image-wrapper">
            {!isImgLoaded && <ImageLoading borderRadius="50%" />}
            <img
              alt={`${userProfile.nickname} 프로필 사진`}
              src={userProfile.profilePictureUrl}
              onLoad={() => setIsImgLoaded(true)}
              style={{ display: !isImgLoaded ? 'none' : 'block' }}
            />
          </div>
          <figcaption className="my-profile-preview__nickname">{userProfile.nickname}</figcaption>
        </figure>

        <div className="my-profile-preview__right">
          <dl className="my-profile-preview__info">
            {infoItems.map((item) => {
              const ItemIcon = item.icon;

              return (
                <div className="my-profile-preview__info-box" key={item.label}>
                  <dt className="my-profile-preview__info-label">
                    <ItemIcon aria-hidden="true" size="1em" />
                    <span className="sr-only">{item.label}</span>
                  </dt>
                  <dd className="my-profile-preview__info-text">{item.value}</dd>
                </div>
              );
            })}
          </dl>
          <a
            className="my-profile-preview__link"
            href={previewHref}
            onClick={handlePreviewClick}
          >
            미리보기
            <ChevronRight aria-hidden="true" size="1em" />
          </a>
        </div>
      </div>

      <div className="my-profile-preview__menu">
        <Button text="프로필 수정" onClick={() => router.push('/my-profile')} />
        <Button text="셀소 만들기" onClick={handleMakeSelso} />
      </div>
      <p className="my-profile-preview__selso-note">
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
