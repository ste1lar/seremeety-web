import '../common/styles/Header.css';
import { useNavigate } from 'react-router-dom';
import sereMeetyLogo from '../../assets/images/seremeety-logo.png';
import Button from '../common/button/Button';

const RequestHeader = ({ isReceived, setIsReceived }) => {
  const navigate = useNavigate();
  return (
    <div className="header header--request">
      <div className="header__logo" onClick={() => navigate('/mypage')}>
        <img alt="LOGO" src={sereMeetyLogo} />
        Seremeety
      </div>
      <div className="header__content">
        <h2 className="header__title">REQUEST</h2>
        <div className="header__menu">
          <Button
            text="받은 요청"
            type={isReceived ? '' : 'light'}
            onClick={() => setIsReceived(true)}
          />
          <Button
            text="보낸 요청"
            type={isReceived ? 'light' : ''}
            onClick={() => setIsReceived(false)}
          />
        </div>
      </div>
    </div>
  );
};

export default RequestHeader;
