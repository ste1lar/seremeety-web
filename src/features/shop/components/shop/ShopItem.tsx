import { Music4 } from 'lucide-react';
import type { ShopItemConfig } from '@/shared/types/domain';

interface ShopItemProps extends ShopItemConfig {
  requestPayment: (quantity: number, price: number) => void;
}

const ShopItem = ({ quantity, discount, price, requestPayment }: ShopItemProps) => {
  return (
    <button className="shop-item" type="button" onClick={() => requestPayment(quantity, price)}>
      <div className="shop-item__quantity">
        <Music4 aria-hidden="true" size="1em" />
        {quantity}
      </div>
      <div className="shop-item__price">
        <div className="shop-item__discount">{discount ? `${discount}% 할인` : ''}</div>
        <div className="shop-item__price-text">{`₩ ${price.toLocaleString()}`}</div>
      </div>
    </button>
  );
};

export default ShopItem;
