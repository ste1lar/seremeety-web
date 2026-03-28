'use client';

import { useContext } from 'react';
import {
  MypageDispatchContext,
  MypageStateContext,
  MypageStatusContext,
} from '@/features/profile/context/MypageContext';
import PageTransition from '@/shared/components/common/PageTransition';
import Loading from '@/shared/components/common/loading/Loading';
import ShopHeader from '@/features/shop/components/shop/ShopHeader';
import ShopContent from '@/features/shop/components/shop/ShopContent';

const ShopPage = () => {
  const state = useContext(MypageStateContext);
  const { isFetching } = useContext(MypageStatusContext);
  const { onUpdateCoin } = useContext(MypageDispatchContext);

  return (
    <div className="shop">
      <PageTransition>
        {isFetching || !state ? (
          <Loading className="shop-content__loading" />
        ) : (
          <>
            <ShopHeader userProfile={state} />
            <ShopContent userProfile={state} onUpdateCoin={onUpdateCoin} />
          </>
        )}
      </PageTransition>
    </div>
  );
};

export default ShopPage;
