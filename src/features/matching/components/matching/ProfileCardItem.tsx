import { useState, type MouseEvent } from 'react';
import { Mars, Venus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import ImageLoading from '@/shared/components/common/image-loading/ImageLoading';
import React from 'react';
import sereMeetyLogo from '@/shared/assets/images/seremeety-logo.png';
import type { UserProfile } from '@/shared/types/domain';

interface ProfileCardItemProps
  extends Pick<UserProfile, 'age' | 'gender' | 'nickname' | 'place' | 'profilePictureUrl'> {
  uid?: string;
  profileStatus: UserProfile['profileStatus'];
}

const ProfileCardItem = ({
  uid,
  profilePictureUrl,
  nickname,
  age,
  gender,
  place,
  profileStatus,
}: ProfileCardItemProps) => {
  const [isImgLoaded, setIsImgLoaded] = useState(false);
  const router = useRouter();
  const profileHref = uid ? `/profile/${uid}` : '#';
  const GenderIcon = gender === 'male' ? Mars : Venus;

  const handleProfileCardClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();

    if (!uid) {
      return;
    }

    router.push(`/profile/${uid}`);
  };

  return (
    <a className="profile-card" href={profileHref} onClick={handleProfileCardClick}>
      <figure className="profile-card__img">
        {!isImgLoaded && <ImageLoading borderRadius={'0.3125rem'} />}
        <img
          alt={profileStatus === 1 ? `${nickname} 프로필 사진` : '비공개 프로필 기본 이미지'}
          src={profileStatus === 1 ? profilePictureUrl : sereMeetyLogo.src}
          onLoad={() => setIsImgLoaded(true)}
          style={{ display: !isImgLoaded ? 'none' : 'block' }}
        />
      </figure>
      <div
        className="profile-card__content"
        style={{
          visibility: profileStatus === 1 ? 'visible' : 'hidden',
        }}
      >
        <strong className="profile-card__nickname">
          {profileStatus === 1 ? nickname : 'nickname'}
        </strong>
        <p className="profile-card__age-gender">
          {profileStatus === 1 ? age : 'age'}
          {profileStatus === 1 && (
            <GenderIcon
              aria-hidden="true"
              size="1em"
              style={{ color: gender === 'male' ? '#92a8d1' : '#f7cac9' }}
            />
          )}
          {profileStatus === 1 ? place.split(' ')[0] : 'place'}
        </p>
      </div>
    </a>
  );
};

export default React.memo(ProfileCardItem);
