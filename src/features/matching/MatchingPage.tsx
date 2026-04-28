'use client';

import { useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MypageStateContext, MypageStatusContext } from '@/features/profile/context/MypageContext';
import {
  MatchingLoadingContext,
  MatchingStateContext,
} from '@/features/matching/context/MatchingContext';
import MatchingContent from '@/features/matching/components/matching/MatchingContent';
import PageTransition from '@/shared/components/common/PageTransition';
import Loading from '@/shared/components/common/loading/Loading';
import MatchingFilter from '@/features/matching/components/matching/MatchingFilter';
import MatchingHeader from '@/features/matching/components/matching/MatchingHeader';
import Modal, { type ModalConfig } from '@/shared/components/common/modal/Modal';
import type { MatchingFilters } from '@/shared/types/domain';
import styles from './MatchingPage.module.scss';

const defaultFilters: MatchingFilters = {
  ageRange: [18, 30],
  place: '',
};

const MatchingPage = () => {
  const state = useContext(MatchingStateContext);
  const userProfile = useContext(MypageStateContext);
  const { isFetching: isUserProfileLoading, isFetchError: isUserProfileError } = useContext(MypageStatusContext);
  const isMatchingLoading = useContext(MatchingLoadingContext);
  const router = useRouter();
  const [modal, setModal] = useState<ModalConfig | null>(null);
  const [openFilterModal, setOpenFilterModal] = useState(false);
  const [filters, setFilters] = useState<MatchingFilters>(defaultFilters);
  const isContentLoading = isUserProfileLoading || isMatchingLoading;

  useEffect(() => {
    if (!isUserProfileLoading && userProfile && userProfile.profileStatus !== 1) {
      router.replace('/my-profile');
    }
  }, [isUserProfileLoading, userProfile, router]);

  useEffect(() => {
    const savedFilters = sessionStorage.getItem('filters');
    if (savedFilters) {
      try {
        const parsedFilters = JSON.parse(savedFilters) as Partial<MatchingFilters>;
        const ageRange = parsedFilters.ageRange;

        setFilters({
          ageRange:
            Array.isArray(ageRange) && ageRange.length === 2
              ? [Number(ageRange[0]), Number(ageRange[1])]
              : defaultFilters.ageRange,
          place: typeof parsedFilters.place === 'string' ? parsedFilters.place : '',
        });
      } catch (error) {
        console.error(error);
      }
    }
  }, []);

  useEffect(() => {
    sessionStorage.setItem('filters', JSON.stringify(filters));
  }, [filters]);

  const toggleFilterModal = () => {
    if (!userProfile) {
      return;
    }

    if (userProfile.profileStatus !== 1) {
      setModal({
        actions: [{ label: '확인', onClick: () => router.replace('/my-profile') }],
        closeOnBackdrop: false,
        showCloseButton: false,
        title: '프로필 필터',
        description: '먼저 프로필을 완성해주세요',
      });
      return;
    }
    setOpenFilterModal((prev) => !prev);
  };

  const applyFilters = (newFilters: MatchingFilters) => {
    setFilters(newFilters);
    setOpenFilterModal(false);
  };

  return (
    <section className={styles.root} aria-labelledby="matching-heading">
      <MatchingHeader onFilterClick={toggleFilterModal} />
      {openFilterModal && userProfile && (
        <PageTransition direction={'y'}>
          <MatchingFilter filters={filters} onApply={applyFilters} onClose={toggleFilterModal} />
        </PageTransition>
      )}
      {!openFilterModal &&
        (isUserProfileError ? (
          <p className={styles.error}>프로필 정보를 불러오지 못했어요. 잠시 후 다시 시도해주세요.</p>
        ) : isContentLoading || !userProfile ? (
          <Loading className={styles.loading} />
        ) : (
          <MatchingContent
            profileCards={state}
            filters={filters}
            profileStatus={userProfile.profileStatus}
          />
        ))}
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
    </section>
  );
};

export default MatchingPage;
