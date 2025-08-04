import '../common/styles/Header.css';
import { useNavigate } from "react-router-dom";
import sereMeetyLogo from '../../assets/images/seremeety-logo.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { icons } from '../../utils';

const ProfileHeader = () => {
    const navigate = useNavigate();
    return (
        <div className="header header--profile">
            <div className="header__logo" onClick={() => navigate('/mypage')}>
                <img alt="LOGO" src={sereMeetyLogo} />
                Seremeety
            </div>
            <div className="header__back-button" onClick={() => navigate(-1)}>
                <FontAwesomeIcon icon={icons.faAngleLeft} />
            </div>
            <div className="header__content">
                <h2 className="header__title">PROFILE</h2>
            </div>
        </div>
    );
};

export default ProfileHeader;