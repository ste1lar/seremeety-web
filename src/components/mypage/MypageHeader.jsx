import '../common/styles/Header.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { icons } from "../../utils";
import { useNavigate } from "react-router-dom";
import sereMeetyLogo from '../../assets/images/seremeety-logo.png';

const MypageHeader = ({ userProfile }) => {
    const navigate = useNavigate();
    return (
        <div className="header header--mypage">
            <div className="header__logo" onClick={() => navigate('/mypage')}>
                <img alt="LOGO" src={sereMeetyLogo} />
                Seremeety
            </div>
            <div className="header__content">
                <h2 className="header__title">MYPAGE</h2>
                <div className="header__menu">
                    <div className="header__note" onClick={() => navigate('/shop')}>
                        <FontAwesomeIcon icon={icons.faMusic} />
                        {userProfile.coin}
                    </div>
                    <FontAwesomeIcon
                        className="header__setting"
                        icon={icons.faGear}
                        onClick={() => navigate('/setting')}
                    />
                </div>
            </div>
        </div>
    );
};

export default MypageHeader;