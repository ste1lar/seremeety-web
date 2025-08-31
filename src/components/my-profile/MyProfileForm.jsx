import './MyProfileForm.css';
import React, { useCallback, useEffect, useState } from 'react';
import { getAgeByBirthDate, icons } from '../../utils';
import Select from 'react-select';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Tooltip } from 'react-tooltip';
import CustomRadio from '../common/custom-radio/CustomRadio';

const MyProfileForm = ({ field, type, id, options = [], data, onChange, isDisabled }) => {
  const [mainPlace, setMainPlace] = useState('');
  const [subPlace, setSubPlace] = useState('');

  useEffect(() => {
    if (data && id === 'place') {
      const [main, sub] = data.split(' ');
      setMainPlace(main || '');
      setSubPlace(sub || '');
    }
  }, [data]);

  const handleChange = useCallback(
    (e) => {
      onChange(id, e.target.value);
    },
    [id, onChange]
  );

  const handleSelectChange = (selectedOption) => {
    onChange(id, selectedOption.value);
  };

  const handlePlaceChange = (selectedOption, isMain) => {
    if (isMain) {
      setMainPlace(selectedOption.value);
      setSubPlace('');
    } else {
      setSubPlace(selectedOption.value);
    }
  };

  useEffect(() => {
    onChange(id, `${mainPlace} ${subPlace}`.trim());
  }, [mainPlace, subPlace, id, onChange]);

  const selectOptions = options.map((it) => ({ value: it, label: it }));
  const mainPlaceOptions = options.map(([it]) => ({ value: it, label: it }));
  const subPlaceSelectOptions = options.find(([it]) => it === mainPlace)?.[1] || [];
  const subPlaceOptions = subPlaceSelectOptions.map((it) => ({ value: it, label: it }));

  return (
    <div className={`my-profile-form ${id === 'introduce' ? 'my-profile-form--introduce' : ''}`}>
      <div className="my-profile-form__label">
        {field}
        {['university', 'birthdate', 'introduce'].includes(id) && (
          <>
            <FontAwesomeIcon
              data-tooltip-id={`${id}-tooltip`}
              data-tooltip-content={
                id === 'university'
                  ? '학교가 목록에 없으면 기타를 선택해주세요'
                  : id === 'birthdate'
                    ? '프로필 카드에는 만 나이로 표기됩니다'
                    : '최대 500자까지 입력 가능합니다'
              }
              icon={icons.faCircleInfo}
              className="my-profile-form__icon"
            />
            <Tooltip className="my-profile-tooltip" id={`${id}-tooltip`} />
          </>
        )}
      </div>

      {type === 'text' && (
        <input
          type="text"
          id={id}
          value={data || ''}
          onChange={handleChange}
          className="my-profile-form__input"
        />
      )}

      {type === 'date' && (
        <div className="my-profile-form__birthdate-wrapper">
          <input
            type="date"
            id={id}
            value={data || ''}
            onChange={handleChange}
            disabled={isDisabled}
            className={`my-profile-form__input ${isDisabled ? 'my-profile-form__input--disabled' : ''}`}
          />
          <span className="my-profile-form__birthdate-text">
            {data ? `${getAgeByBirthDate(data)}세` : ''}
          </span>
        </div>
      )}

      {type === 'radio' && (
        <div className="my-profile-form__radio-group">
          {options.map((it, idx) => (
            <div className="my-profile-form__radio-wrapper" key={idx}>
              <CustomRadio
                name={id}
                value={it}
                checked={it === data}
                onChange={handleChange}
                label={it === 'male' ? '남성' : '여성'}
                disabled={isDisabled}
              />
            </div>
          ))}
        </div>
      )}

      {type === 'select' && ['mbti', 'university'].includes(id) && (
        <Select
          classNamePrefix="my-profile-select"
          id={id}
          value={selectOptions.find((option) => option.value === data)}
          onChange={handleSelectChange}
          options={selectOptions}
          placeholder={`${id.toUpperCase()} 선택`}
          noOptionsMessage={() => ''}
        />
      )}

      {type === 'select' && id === 'place' && (
        <div className="my-profile-form__place-wrapper">
          <Select
            classNamePrefix="my-profile-select"
            id={id}
            value={mainPlaceOptions.find((option) => option.value === mainPlace)}
            onChange={(option) => handlePlaceChange(option, true)}
            options={mainPlaceOptions}
            placeholder="지역"
            noOptionsMessage={() => ''}
          />
          <Select
            classNamePrefix="my-profile-select"
            key={mainPlace}
            id={id}
            value={subPlaceOptions.find((option) => option.value === subPlace)}
            onChange={(option) => handlePlaceChange(option, false)}
            options={subPlaceOptions}
            placeholder="세부 지역"
            noOptionsMessage={() => ''}
            isDisabled={!mainPlace}
          />
        </div>
      )}

      {type === 'textarea' && (
        <textarea
          id={id}
          value={data || ''}
          onChange={handleChange}
          className="my-profile-form__textarea"
        />
      )}
    </div>
  );
};

export default React.memo(MyProfileForm);
