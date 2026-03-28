import { useState } from 'react';
import SettingItem from './SettingItem';
import Modal, { type ModalConfig } from '@/shared/components/common/modal/Modal';
import { auth } from '@/firebase';

type SettingEntry =
  | { content: string; kind: 'coming-soon'; title: string }
  | { content: string; kind: 'logout' };

const settingItems: SettingEntry[] = [
  { content: '알림 설정 / 通知設定', kind: 'coming-soon', title: '알림 설정' },
  { content: '아는 사람 피하기 / 知り合いをブロック', kind: 'coming-soon', title: '아는 사람 피하기' },
  { content: '이용약관 / 利用規約', kind: 'coming-soon', title: '이용약관' },
  { content: '문의하기 / お問い合わせ', kind: 'coming-soon', title: '문의하기' },
  { content: '로그아웃 / ログアウト', kind: 'logout' },
];

const SettingContent = () => {
  const [modal, setModal] = useState<ModalConfig | null>(null);

  const handleItemClick = (item: SettingEntry) => {
    if (item.kind === 'logout') {
      void auth.signOut();
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
      return;
    }

    setModal({
      actions: [{ label: '확인' }],
      closeOnBackdrop: false,
      description: '준비 중인 기능이에요',
      showCloseButton: false,
      title: item.title,
    });
  };

  return (
    <div className="setting-content">
      {settingItems.map((item, idx) => (
        <SettingItem key={idx} content={item.content} onClick={() => handleItemClick(item)} />
      ))}
      <Modal
        open={modal !== null}
        title={modal?.title ?? ''}
        description={modal?.description}
        actions={modal?.actions}
        closeOnBackdrop={modal?.closeOnBackdrop}
        showCloseButton={modal?.showCloseButton}
        onClose={() => setModal(null)}
      >
        {modal?.children}
      </Modal>
    </div>
  );
};

export default SettingContent;
