import React from 'react';
import seremeetyLogo from '@/shared/assets/images/seremeety-logo.png';

const LoginLogo = () => {
  return (
    <div className="login-logo">
      <img alt="SEREMEETY" src={seremeetyLogo.src} />
      <div className="login-logo__text">Seremeety</div>
    </div>
  );
};

export default React.memo(LoginLogo);
