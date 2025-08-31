import React from 'react';
import './LoginLogo.css';
import seremeetyLogo from '../../assets/images/seremeety-logo.png';

const LoginLogo = () => {
  return (
    <div className="login-logo">
      <img alt="SEREMEETY" src={seremeetyLogo} />
      <div className="login-logo__text">Seremeety</div>
    </div>
  );
};

export default React.memo(LoginLogo);
