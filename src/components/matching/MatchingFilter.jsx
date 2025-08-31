import { useState } from 'react';
import './MatchingFilter.css';
import Select from 'react-select';
import { placeList } from '../../places';
import Button from '../common/button/Button';

const MatchingFilter = ({ filters, onApply, onClose, style }) => {
  const [ageRange, setAgeRange] = useState(filters.ageRange);
  const [place, setPlace] = useState(filters.place);

  const mainPlaceOptions = placeList.map(([it]) => ({ value: it, label: it }));

  const setYoungerAgeRange = (e) => {
    const input = e.target.value;
    if (/^[\d-]*$/.test(input)) {
      const youngerAge = input === '' ? '' : +input;
      setAgeRange([youngerAge, Math.max(youngerAge, ageRange[1])]);
    }
  };

  const setElderAgeRange = (e) => {
    const input = e.target.value;
    if (/^[\d-]*$/.test(input)) {
      const elderAge = input === '' ? '' : +input;
      setAgeRange([ageRange[0], elderAge]);
    }
  };

  const handleApply = () => {
    const minAge = parseInt(ageRange[0], 10);
    const maxAge = parseInt(ageRange[1], 10);
    const isAgeValid = !isNaN(minAge) && !isNaN(maxAge) && minAge <= maxAge;

    onApply({
      ageRange: isAgeValid ? [minAge, maxAge] : [18, 30],
      place: place.trim() !== '' ? place : '',
    });
  };

  return (
    <div className="matching-filter" style={style}>
      <div className="matching-filter__content">
        <div className="matching-filter__age">
          <h3 className="matching-filter__subtitle">매칭 상대 나이</h3>
          <div className="matching-filter__age-wrapper">
            <input
              id="youngerAgeRange"
              type="tel"
              maxLength={2}
              value={ageRange[0]}
              onChange={setYoungerAgeRange}
            />
            <span>세 이상</span>
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
        <div className="matching-filter__place">
          <h3 className="matching-filter__subtitle">매칭 상대 지역</h3>
          <Select
            classNamePrefix="my-profile-select"
            value={mainPlaceOptions.find((option) => option.value === place) || null}
            onChange={(selectedOption) => setPlace(selectedOption ? selectedOption.value : '')}
            options={mainPlaceOptions}
            placeholder="지역"
            noOptionsMessage={() => ''}
            isClearable
          />
        </div>
      </div>
      <div className="matching-filter__menu">
        <Button text="닫기" type="light" onClick={onClose} />
        <Button text="적용" onClick={handleApply} />
      </div>
    </div>
  );
};

export default MatchingFilter;
