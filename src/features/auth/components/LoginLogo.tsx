import React from 'react';
import Image from 'next/image';
import seremeetyLogo from '@/shared/assets/images/seremeety-logo.png';
import styles from './LoginLogo.module.scss';

const LoginLogo = () => {
  return (
    <div className={styles.root}>
      <Image alt="SEREMEETY" src={seremeetyLogo} width={80} height={80} priority />
      <p className={styles.title}>Seremeety</p>
    </div>
  );
};

export default React.memo(LoginLogo);
