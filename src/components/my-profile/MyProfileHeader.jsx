import '../common/styles/Header.css';
import { useNavigate } from 'react-router-dom';
import sereMeetyLogo from '../../assets/images/seremeety-logo.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { icons } from '../../utils';

const MyProfileHeader = ({ userProfile, onSaveProfile }) => {
  const navigate = useNavigate();
  return (
    <div className="header header--my-profile">
      <div className="header__logo" onClick={() => navigate('/mypage')}>
        <img alt="LOGO" src={sereMeetyLogo} />
        Seremeety
      </div>
      <div className="header__back-button" onClick={() => navigate(-1)}>
        <FontAwesomeIcon icon={icons.faAngleLeft} />
      </div>
      <div className="header__content">
        <h2 className="header__title">MY PROFILE</h2>
        <div className="header__menu">
          <div className="header__save-profile" onClick={() => onSaveProfile(userProfile)}>
            저장
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProfileHeader;
