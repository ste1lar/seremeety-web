import '../common/styles/Header.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { icons } from '../../utils';
import { useNavigate } from 'react-router-dom';
import sereMeetyLogo from '../../assets/images/seremeety-logo.png';

const MatchingHeader = ({ onFilterClick }) => {
  const navigate = useNavigate();
  return (
    <div className="header header--matching">
      <div className="header__logo" onClick={() => navigate('/mypage')}>
        <img alt="LOGO" src={sereMeetyLogo} />
        Seremeety
      </div>
      <div className="header__content">
        <h2 className="header__title">DISCOVER</h2>
        <div className="header__menu">
          <FontAwesomeIcon
            className="header__filter"
            icon={icons.faSliders}
            onClick={onFilterClick}
          />
        </div>
      </div>
    </div>
  );
};

export default MatchingHeader;
