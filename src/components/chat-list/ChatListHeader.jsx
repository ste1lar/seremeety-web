import '../common/styles/Header.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useNavigate } from 'react-router-dom';
import sereMeetyLogo from '../../assets/images/seremeety-logo.png';
import { icons } from '../../utils';

const ChatListHeader = () => {
  const navigate = useNavigate();
  return (
    <div className="header header--chat">
      <div className="header__logo" onClick={() => navigate('/mypage')}>
        <img alt="LOGO" src={sereMeetyLogo} />
        Seremeety
      </div>
      <div className="header__content">
        <h2 className="header__title">CHATS</h2>
        <div className="header__menu">
          <FontAwesomeIcon className="header__search" icon={icons.faMagnifyingGlass} />
        </div>
      </div>
    </div>
  );
};

export default ChatListHeader;
