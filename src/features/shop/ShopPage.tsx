'use client';

import {
  useGetMeQuery,
  useUpdateMeMutation,
} from '@/shared/lib/api/profileApi';
import PageTransition from '@/shared/components/common/PageTransition';
import Loading from '@/shared/components/common/loading/Loading';
import ShopHeader from '@/features/shop/components/shop/ShopHeader';
import ShopContent from '@/features/shop/components/shop/ShopContent';
import type { UserProfile } from '@/shared/types/domain';
import shopContentStyles from './components/shop/ShopContent.module.scss';
import styles from './ShopPage.module.scss';

const ShopPage = () => {
  const { data: state, isLoading: isFetching } = useGetMeQuery();
  const [updateMe] = useUpdateMeMutation();

  const handleUpdateCoin = async (newData: UserProfile) => {
    try {
      await updateMe(newData).unwrap();
    } catch {
      // 결제 완료 모달은 ShopContent가 표시하므로 여기서 별도 안내는 생략한다.
    }
  };

  return (
    <section className={styles.root} aria-labelledby="shop-heading">
      <PageTransition>
        {isFetching || !state ? (
          <Loading className={shopContentStyles.loading} />
        ) : (
          <>
            <ShopHeader userProfile={state} />
            <ShopContent userProfile={state} onUpdateCoin={handleUpdateCoin} />
          </>
        )}
      </PageTransition>
    </section>
  );
};

export default ShopPage;
