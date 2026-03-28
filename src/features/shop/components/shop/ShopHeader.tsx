import { Music4 } from 'lucide-react';
import Header from '@/shared/components/common/Header';
import type { UserProfile } from '@/shared/types/domain';

interface ShopHeaderProps {
  userProfile: UserProfile;
}

const ShopHeader = ({ userProfile }: ShopHeaderProps) => {
  return (
    <Header
      variant="shop"
      title="SHOP"
      showBackButton
      menu={
        <>
          <div className="header__note">
            <Music4 aria-hidden="true" size="1em" />
            {userProfile.coin}
          </div>
        </>
      }
    />
  );
};

export default ShopHeader;
