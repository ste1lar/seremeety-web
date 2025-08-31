import './Setting.css';
import PageTransition from '../../components/common/PageTransition';
import SettingHeader from '../../components/setting/SettingHeader';
import SettingContent from '../../components/setting/SettingContent';

const Setting = () => {
  return (
    <div className="setting">
      <PageTransition>
        <SettingHeader />
        <SettingContent />
      </PageTransition>
    </div>
  );
};

export default Setting;
