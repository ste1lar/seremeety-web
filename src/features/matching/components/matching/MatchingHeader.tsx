import { SlidersHorizontal } from 'lucide-react';
import Header from '@/shared/components/common/Header';

interface MatchingHeaderProps {
  onFilterClick: () => void;
}

const MatchingHeader = ({ onFilterClick }: MatchingHeaderProps) => {
  return (
    <Header
      variant="matching"
      title="DISCOVER"
      menuAriaLabel="매칭 메뉴"
      menu={
        <>
          <button className="header__filter" type="button" onClick={onFilterClick}>
            <SlidersHorizontal aria-hidden="true" size="1em" />
          </button>
        </>
      }
    />
  );
};

export default MatchingHeader;
