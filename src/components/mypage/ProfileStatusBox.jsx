import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './ProfileStatusBox.css';
import { icons } from '../../utils';

const ProfileStatusBox = ({ stats }) => {
  return (
    <div className="profile-status-box">
      <div className="profile-status-box__row">
        <div className="profile-status-box__label">
          <FontAwesomeIcon icon={icons.faImage} />
          프로필 사진
        </div>
        <div className="profile-status-box__value">
          {stats.hasProfileImage ? '등록 완료' : '미등록'}
        </div>
      </div>
      <div className="profile-status-box__row">
        <div className="profile-status-box__label">
          <FontAwesomeIcon icon={icons.faPenToSquare} />
          자기소개
        </div>
        <div className="profile-status-box__value">{stats.introLength}/500자</div>
      </div>
      <div className="profile-status-box__row">
        <div className="profile-status-box__label">
          <FontAwesomeIcon icon={icons.faSparkles} />
          셀소 상태
        </div>
        <div className="profile-status-box__value">{stats.hasSelso ? '등록됨' : '미등록'}</div>
      </div>
      <div className="profile-status-box__row">
        <div className="profile-status-box__label">
          <FontAwesomeIcon icon={icons.faEnvelopeOpen} />
          받은 요청
        </div>
        <div className="profile-status-box__value">{stats.requestsReceived}회</div>
      </div>
      <div className="profile-status-box__row">
        <div className="profile-status-box__label">
          <FontAwesomeIcon icon={icons.faStarChristmas} />
          프로필 매력
        </div>
        <div className="profile-status-box__value">{stats.profileRating || 'Shine'}</div>
      </div>
      <div className="profile-status-box__note">
        현재 준비 중인 기능으로, 일부 항목은 임의로 표시됩니다.
      </div>
    </div>
  );
};

export default ProfileStatusBox;
