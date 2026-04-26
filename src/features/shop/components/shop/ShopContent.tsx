import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import BootPay from 'bootpay-js';
import ShopItem from './ShopItem';
import Modal, { type ModalConfig } from '@/shared/components/common/modal/Modal';
import { shopItems } from '@/shared/lib/constants';
import type { BootPayPayload, UserProfile } from '@/shared/types/domain';
import styles from './ShopContent.module.scss';

interface ShopContentProps {
  onUpdateCoin: (newData: UserProfile) => Promise<void>;
  userProfile: UserProfile;
}

const ShopContent = ({ userProfile, onUpdateCoin }: ShopContentProps) => {
  const [modal, setModal] = useState<ModalConfig | null>(null);

  const requestPayment = (quantity: number, price: number) => {
    BootPay.request({
      price,
      application_id: '66d88be631d38115ba3fc1ed',
      name: `세레미티 ${quantity}음표`,
      pg: 'welcome',
      method: 'card',
      show_agree_window: 0,

      user_info: {
        phone: userProfile.phone,
      },
      order_id: `order_id_${new Date().getTime()}`,
      params: { callback1: 'callback1', callback2: 'callback2', customvar1234: 'customvar1234' },
      account_expire_at: '2020-10-25',
      extra: {
        start_at: '2019-05-10',
        end_at: '2022-05-10',
        vbank_result: 1,
        quota: '0,2,3',
        theme: 'purple',
        custom_background: '#00a086',
        custom_font_color: '#ffffff',
      },
    })
      .error(() => {
        setModal({
          actions: [{ label: '확인' }],
          closeOnBackdrop: false,
          description: '결제 중 오류가 발생했습니다',
          showCloseButton: false,
          title: '결제 실패',
        });
      })
      .cancel(() => undefined)
      .ready(() => undefined)
      .confirm((data: BootPayPayload) => {
        const shouldConfirmTransaction = true;
        if (shouldConfirmTransaction) {
          BootPay.transactionConfirm(data);
        } else {
          BootPay.removePaymentWindow();
        }
      })
      .close(() => undefined)
      .done(async () => {
        await onUpdateCoin({ ...userProfile, coin: userProfile.coin + quantity });
        setModal({
          actions: [{ label: '확인' }],
          closeOnBackdrop: false,
          description: `${quantity}음표가 충전되었어요!`,
          showCloseButton: false,
          title: '결제 성공',
        });
      });
  };

  const handleCouponClick = () => {
    setModal({
      actions: [{ label: '확인' }],
      closeOnBackdrop: false,
      description: '준비 중인 기능이에요',
      showCloseButton: false,
      title: '쿠폰 등록',
    });
  };

  return (
    <div className={styles.root}>
      <div className={styles.description}>
        <p>음표는 세레미티 매칭 활동에 사용됩니다!</p>
        <p>현재는 테스트 환경으로, 실제 결제는 이루어지지 않습니다.</p>
      </div>
      <button className={styles.coupon} type="button" onClick={handleCouponClick}>
        {'쿠폰 등록'}
        <ChevronRight aria-hidden="true" size="1em" />
      </button>
      {shopItems.map((item) => (
        <ShopItem key={`${item.quantity}-${item.price}`} {...item} requestPayment={requestPayment} />
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

export default ShopContent;
