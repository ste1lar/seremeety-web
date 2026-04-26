'use client';

import PageTransition from '@/shared/components/common/PageTransition';
import SettingHeader from '@/features/setting/components/setting/SettingHeader';
import SettingContent from '@/features/setting/components/setting/SettingContent';
import styles from './SettingPage.module.scss';

const SettingPage = () => {
  return (
    <section className={styles.root} aria-labelledby="setting-heading">
      <PageTransition>
        <SettingHeader />
        <SettingContent />
      </PageTransition>
    </section>
  );
};

export default SettingPage;
