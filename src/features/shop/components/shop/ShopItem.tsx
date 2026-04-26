import { Music4 } from 'lucide-react';
import type { ShopItemConfig } from '@/shared/types/domain';
import styles from './ShopItem.module.scss';

interface ShopItemProps extends ShopItemConfig {
  requestPayment: (quantity: number, price: number) => void;
}

const ShopItem = ({ quantity, discount, price, requestPayment }: ShopItemProps) => {
  return (
    <button className={styles.root} type="button" onClick={() => requestPayment(quantity, price)}>
      <div className={styles.quantity}>
        <Music4 aria-hidden="true" size="1em" />
        {quantity}
      </div>
      <div className={styles.price}>
        <div className={styles.discount}>{discount ? `${discount}% 할인` : ''}</div>
        <div className={styles.amount}>{`₩ ${price.toLocaleString()}`}</div>
      </div>
    </button>
  );
};

export default ShopItem;
