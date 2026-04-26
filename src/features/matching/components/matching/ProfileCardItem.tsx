import { useState, type MouseEvent } from 'react';
import { Mars, Venus } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import ImageLoading from '@/shared/components/common/image-loading/ImageLoading';
import React from 'react';
import sereMeetyLogo from '@/shared/assets/images/seremeety-logo.png';
import type { UserProfile } from '@/shared/types/domain';
import styles from './ProfileCardItem.module.scss';

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
  const profileHref = uid ? `/profile/${uid}` : '#';
  const GenderIcon = gender === 'male' ? Mars : Venus;

  const handleProfileCardClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!uid) {
      event.preventDefault();
      return;
    }
  };

  return (
    <Link className={styles.root} href={profileHref} onClick={handleProfileCardClick}>
      <figure className={styles.media}>
        {!isImgLoaded && <ImageLoading borderRadius={'0.3125rem'} />}
        <Image
          alt={profileStatus === 1 ? `${nickname} 프로필 사진` : '비공개 프로필 기본 이미지'}
          src={profileStatus === 1 ? profilePictureUrl : sereMeetyLogo.src}
          fill
          sizes="(max-width: 480px) 45vw, 12rem"
          onLoad={() => setIsImgLoaded(true)}
          style={{ display: !isImgLoaded ? 'none' : 'block' }}
        />
      </figure>
      <div
        className={styles.content}
        style={{
          visibility: profileStatus === 1 ? 'visible' : 'hidden',
        }}
      >
        <strong className={styles.nickname}>
          {profileStatus === 1 ? nickname : 'nickname'}
        </strong>
        <p className={styles.meta}>
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
    </Link>
  );
};

export default React.memo(ProfileCardItem);
