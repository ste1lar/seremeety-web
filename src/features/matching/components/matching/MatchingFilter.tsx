import { useState, type ChangeEvent, type CSSProperties } from 'react';
import Select from 'react-select';
import { placeList } from '@/shared/data/places';
import Button from '@/shared/components/common/button/Button';
import type { MatchingFilters, SelectOption } from '@/shared/types/domain';
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

  const mainPlaceOptions: SelectOption[] = placeList.map(([it]) => ({ value: it, label: it }));

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
            classNamePrefix="my-profile-select"
            inputId="matching-place"
            instanceId="matching-place"
            value={mainPlaceOptions.find((option) => option.value === place) || null}
            onChange={(selectedOption) => setPlace(selectedOption?.value ?? '')}
            options={mainPlaceOptions}
            placeholder="지역"
            noOptionsMessage={() => ''}
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
