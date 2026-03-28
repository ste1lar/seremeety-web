import { useMemo, useState } from 'react';
import { ChevronDown, PanelsTopLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import ProfileCardItem from './ProfileCardItem';
import Button from '@/shared/components/common/button/Button';
import EmptyState from '@/shared/components/common/empty-state/EmptyState';
import Modal, { type ModalConfig } from '@/shared/components/common/modal/Modal';
import type { MatchingFilters, ProfileStatus, UserProfile } from '@/shared/types/domain';

interface MatchingContentProps {
  filters: MatchingFilters;
  profileCards: UserProfile[];
  profileStatus: ProfileStatus;
}

const MatchingContent = ({ profileCards, filters, profileStatus }: MatchingContentProps) => {
  const [modal, setModal] = useState<ModalConfig | null>(null);
  const [visibleCount, setVisibleCount] = useState(8);
  const router = useRouter();

  const filteredCards = useMemo(() => {
    return profileCards.filter((it) => {
      const place = it.place || '';
      const filterPlace = filters.place || '';

      const isValidAgeRange = filters.ageRange[0] <= filters.ageRange[1];
      const isValidPlace = filterPlace.trim() !== '';

      const age = Number.parseInt(it.age.match(/\d+/)?.[0] ?? '0', 10);

      return (
        (isValidAgeRange ? age >= filters.ageRange[0] && age <= filters.ageRange[1] : true) &&
        (isValidPlace ? place.includes(filterPlace) : true)
      );
    });
  }, [profileCards, filters]);

  const showMoreCards = () => {
    if (profileStatus !== 1) {
      setModal({
        actions: [{ label: '확인', onClick: () => router.replace('/my-profile') }],
        closeOnBackdrop: false,
        description: '먼저 프로필을 완성해주세요',
        showCloseButton: false,
        title: '프로필 더 보기',
      });
      return;
    }
    setVisibleCount((prevCount) => prevCount + 8);
  };

  return (
    <div className="matching-content">
      <ul className="matching-content__card-section">
        {filteredCards.slice(0, visibleCount).map((it) => (
          <li className="matching-content__card-item" key={it.uid ?? `${it.nickname}-${it.age}`}>
            <ProfileCardItem {...it} profileStatus={profileStatus} />
          </li>
        ))}
      </ul>
      <div className="matching-content__option-section">
        {visibleCount < filteredCards.length && (
          <Button
            text={'프로필 더 보기'}
            icon={ChevronDown}
            type={'light'}
            onClick={showMoreCards}
          />
        )}
        {visibleCount >= filteredCards.length && (
          <EmptyState icon={PanelsTopLeft} message={'더 이상 프로필이 없어요'} />
        )}
      </div>
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

export default MatchingContent;
