import { useMemo, useState, type ChangeEvent, type CSSProperties } from 'react';
import { placeList } from '@/shared/data/places';
import Button from '@/shared/components/common/button/Button';
import Select, { type SelectOption } from '@/shared/components/common/select/Select';
import type { MatchingFilters } from '@/shared/types/domain';
import styles from './MatchingFilter.module.scss';

interface MatchingFilterProps {
  filters: MatchingFilters;
  onApply: (newFilters: MatchingFilters) => void;
  onClose: () => void;
  style?: CSSProperties;
}

type AgeRangeInput = [string, string];

const MatchingFilter = ({ filters, onApply, onClose, style }: MatchingFilterProps) => {
  const [ageRange, setAgeRange] = useState<AgeRangeInput>([
    String(filters.ageRange[0]),
    String(filters.ageRange[1]),
  ]);
  const [place, setPlace] = useState(filters.place);

  const placeOptions: SelectOption[] = useMemo(
    () => placeList.map(([region]) => ({ value: region, label: region })),
    []
  );

  const setYoungerAgeRange = (e: ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    if (/^[\d-]*$/.test(input)) {
      setAgeRange(([, elderAge]) => [input, elderAge]);
    }
  };

  const setElderAgeRange = (e: ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    if (/^[\d-]*$/.test(input)) {
      setAgeRange(([youngerAge]) => [youngerAge, input]);
    }
  };

  const handleApply = () => {
    const minAge = Number.parseInt(ageRange[0], 10);
    const maxAge = Number.parseInt(ageRange[1], 10);
    const isAgeValid = !isNaN(minAge) && !isNaN(maxAge) && minAge <= maxAge;

    onApply({
      ageRange: isAgeValid ? [minAge, maxAge] : [18, 30],
      place: place.trim() !== '' ? place : '',
    });
  };

  return (
    <div className={styles.root} style={style}>
      <div className={styles.content}>
        <div>
          <h3 className={styles.subtitle}>매칭 상대 나이</h3>
          <div className={styles['age-range']}>
            <label className="sr-only" htmlFor="youngerAgeRange">
              최소 나이
            </label>
            <input
              id="youngerAgeRange"
              type="tel"
              maxLength={2}
              value={ageRange[0]}
              onChange={setYoungerAgeRange}
            />
            <span>세 이상</span>
            <label className="sr-only" htmlFor="elderAgeRange">
              최대 나이
            </label>
            <input
              id="elderAgeRange"
              type="tel"
              maxLength={2}
              value={ageRange[1]}
              onChange={setElderAgeRange}
            />
            <span>세 이하</span>
          </div>
        </div>
        <div>
          <h3 className={styles.subtitle}>매칭 상대 지역</h3>
          <Select
            id="matching-place"
            value={place}
            onChange={setPlace}
            options={placeOptions}
            placeholder="전체"
            isClearable
            aria-label="매칭 상대 지역"
          />
        </div>
      </div>
      <div className={styles.actions}>
        <Button text="닫기" type="light" onClick={onClose} />
        <Button text="적용" onClick={handleApply} />
      </div>
    </div>
  );
};

export default MatchingFilter;
