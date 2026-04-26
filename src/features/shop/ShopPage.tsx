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
import shopContentStyles from './components/shop/ShopContent.module.scss';
import styles from './ShopPage.module.scss';

const ShopPage = () => {
  const state = useContext(MypageStateContext);
  const { isFetching } = useContext(MypageStatusContext);
  const { onUpdateCoin } = useContext(MypageDispatchContext);

  return (
    <section className={styles.root} aria-labelledby="shop-heading">
      <PageTransition>
        {isFetching || !state ? (
          <Loading className={shopContentStyles.loading} />
        ) : (
          <>
            <ShopHeader userProfile={state} />
            <ShopContent userProfile={state} onUpdateCoin={onUpdateCoin} />
          </>
        )}
      </PageTransition>
    </section>
  );
};

export default ShopPage;
