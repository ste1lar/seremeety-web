import { useNavigate } from 'react-router-dom';
import './ProfileCardItem.css';
import { useState } from 'react';
import ImageLoading from '../common/image-loading/ImageLoading';
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { icons } from '../../utils';
import sereMeetyLogo from '../../assets/images/seremeety-logo.png';

const ProfileCardItem = ({
  uid,
  profilePictureUrl,
  nickname,
  age,
  gender,
  place,
  profileStatus,
}) => {
  const [isImgLoaded, setIsImgLoaded] = useState(false);
  const navigate = useNavigate();

  const handleProfileCardClick = () => {
    navigate(`/profile/${uid}`);
  };

  return (
    <div className="profile-card" onClick={handleProfileCardClick}>
      <div className="profile-card__img">
        {!isImgLoaded && <ImageLoading borderRadius={'0.3125rem'} />}
        <img
          alt="PROFILE"
          src={profileStatus === 1 ? profilePictureUrl : sereMeetyLogo}
          onLoad={() => setIsImgLoaded(true)}
          style={{ display: !isImgLoaded ? 'none' : 'block' }}
        />
      </div>
      <div
        className="profile-card__content"
        style={{
          visibility: profileStatus === 1 ? 'visible' : 'hidden',
        }}
      >
        <div className="profile-card__nickname">{profileStatus === 1 ? nickname : 'nickname'}</div>
        <div className="profile-card__age-gender">
          {profileStatus === 1 ? age : 'age'}
          {profileStatus === 1 && (
            <FontAwesomeIcon
              icon={gender === 'male' ? icons.faMars : icons.faVenus}
              style={{ color: gender === 'male' ? '#92a8d1' : '#f7cac9' }}
            />
          )}
          {profileStatus === 1 ? place.split(' ')[0] : 'place'}
        </div>
      </div>
    </div>
  );
};

export default React.memo(ProfileCardItem);
