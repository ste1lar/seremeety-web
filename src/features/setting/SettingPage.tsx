'use client';

import PageTransition from '@/shared/components/common/PageTransition';
import SettingHeader from '@/features/setting/components/setting/SettingHeader';
import SettingContent from '@/features/setting/components/setting/SettingContent';

const SettingPage = () => {
  return (
    <div className="setting">
      <PageTransition>
        <SettingHeader />
        <SettingContent />
      </PageTransition>
    </div>
  );
};

export default SettingPage;
