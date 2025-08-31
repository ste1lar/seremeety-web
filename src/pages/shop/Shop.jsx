import './Shop.css';
import { useContext } from 'react';
import { MypageDispatchContext, MypageStateContext } from '../../contexts/MypageContext';
import PageTransition from '../../components/common/PageTransition';
import ShopHeader from '../../components/shop/ShopHeader';
import ShopContent from '../../components/shop/ShopContent';

const Shop = () => {
  const state = useContext(MypageStateContext);
  const { onUpdateCoin } = useContext(MypageDispatchContext);

  return (
    <div className="shop">
      <PageTransition>
        <ShopHeader userProfile={state} />
        <ShopContent userProfile={state} onUpdateCoin={onUpdateCoin} />
      </PageTransition>
    </div>
  );
};

export default Shop;
