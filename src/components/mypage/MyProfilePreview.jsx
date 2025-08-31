import './MyProfilePreview.css';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { icons } from '../../utils';
import ImageLoading from '../common/image-loading/ImageLoading';
import Button from '../common/button/Button';
import { auth } from '../../firebase';
import Swal from 'sweetalert2';

const MyProfilePreview = ({ userProfile }) => {
  const [isImgLoaded, setIsImgLoaded] = useState(false);
  const navigate = useNavigate();

  const handleMakeSelso = () => {
    Swal.fire({
      title: '셀소 만들기',
      text: '준비 중인 기능이에요',
      confirmButtonText: '확인',
      customClass: {
        confirmButton: 'no-focus-outline',
      },
    });
  };

  return (
    <div className="my-profile-preview">
      <div className="my-profile-preview__preview">
        <div className="my-profile-preview__left">
          <div className="my-profile-preview__image-wrapper">
            {!isImgLoaded && <ImageLoading borderRadius="50%" />}
            <img
              alt="PROFILE"
              src={userProfile.profilePictureUrl}
              onLoad={() => setIsImgLoaded(true)}
              style={{ display: !isImgLoaded ? 'none' : 'block' }}
            />
          </div>
          <div className="my-profile-preview__nickname">{userProfile.nickname}</div>
        </div>

        <div className="my-profile-preview__right">
          <div className="my-profile-preview__info">
            <div className="my-profile-preview__info-box">
              <FontAwesomeIcon icon={icons.faCakeCandles} />
              <div className="my-profile-preview__info-text">{userProfile.age}</div>
            </div>
            <div className="my-profile-preview__info-box">
              <FontAwesomeIcon icon={icons.faHeartRegular} />
              <div className="my-profile-preview__info-text">{userProfile.mbti}</div>
            </div>
            <div className="my-profile-preview__info-box">
              <FontAwesomeIcon icon={icons.faLocationArrow} />
              <div className="my-profile-preview__info-text">{userProfile.place}</div>
            </div>
          </div>
          <div
            className="my-profile-preview__link"
            onClick={() =>
              navigate(`/profile/${auth.currentUser.uid}`, {
                state: { isViewOnly: true },
              })
            }
          >
            미리보기
            <FontAwesomeIcon icon={icons.faAngleRight} />
          </div>
        </div>
      </div>

      <div className="my-profile-preview__menu">
        <Button text="프로필 수정" onClick={() => navigate('/my-profile')} />
        <Button text="셀소 만들기" onClick={handleMakeSelso} />
      </div>
      <div className="my-profile-preview__selso-note">
        셀소를 등록하면 프로필이 DISCOVER에 24시간 동안 우선 노출돼요.
      </div>
    </div>
  );
};

export default MyProfilePreview;
