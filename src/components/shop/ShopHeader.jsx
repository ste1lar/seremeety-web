import '../common/styles/Header.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { icons } from "../../utils";
import { useNavigate } from "react-router-dom";
import sereMeetyLogo from '../../assets/images/seremeety-logo.png';

const ShopHeader = ({ userProfile }) => {
    const navigate = useNavigate();
    return (
        <div className="header header--shop">
            <div className="header__logo" onClick={() => navigate('/mypage')}>
                <img alt="LOGO" src={sereMeetyLogo} />
                Seremeety
            </div>
            <div className="header__back-button" onClick={() => navigate(-1)}>
                <FontAwesomeIcon icon={icons.faAngleLeft} />
            </div>
            <div className="header__content">
                <h2 className="header__title">SHOP</h2>
                <div className="header__menu">
                    <div className="header__note">
                        <FontAwesomeIcon icon={icons.faMusic} />
                        {userProfile.coin}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShopHeader;