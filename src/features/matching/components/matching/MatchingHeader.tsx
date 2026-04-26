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
      headingLevel="h1"
      titleId="matching-heading"
      menuAriaLabel="매칭 메뉴"
      menu={
        <>
          <button
            type="button"
            onClick={onFilterClick}
            aria-label="매칭 필터 열기"
          >
            <SlidersHorizontal aria-hidden="true" size="1em" />
          </button>
        </>
      }
    />
  );
};

export default MatchingHeader;
