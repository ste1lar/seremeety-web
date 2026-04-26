import React, { useCallback, useEffect, useState, type ChangeEvent } from 'react';
import { Info } from 'lucide-react';
import Select from 'react-select';
import { Tooltip } from 'react-tooltip';
import CustomRadio from '@/shared/components/common/custom-radio/CustomRadio';
import { getAgeByBirthDate } from '@/shared/lib/format';
import { cx } from '@/shared/lib/classNames';
import type {
  PlaceEntry,
  ProfileFieldId,
  ProfileFieldType,
  SelectOption,
} from '@/shared/types/domain';
import styles from './MyProfileForm.module.scss';

interface MyProfileFormProps {
  field: string;
  type: ProfileFieldType;
  id: ProfileFieldId;
  options?: readonly string[] | readonly PlaceEntry[];
  data: string;
  onChange: (id: ProfileFieldId, value: string) => void;
  isDisabled: boolean;
}

const MyProfileForm = ({
  field,
  type,
  id,
  options = [],
  data,
  onChange,
  isDisabled,
}: MyProfileFormProps) => {
  const [mainPlace, setMainPlace] = useState('');
  const [subPlace, setSubPlace] = useState('');
  const labelId = `${id}-label`;
  const tooltipContent =
    id === 'university'
      ? '학교가 목록에 없으면 기타를 선택해주세요'
      : id === 'birthdate'
        ? '프로필 카드에는 만 나이로 표기됩니다'
        : '최대 500자까지 입력 가능합니다';
  const isNativeInputField = ['text', 'date', 'textarea'].includes(type);

  useEffect(() => {
    if (data && id === 'place') {
      const [main, sub] = data.split(' ');
      setMainPlace(main || '');
      setSubPlace(sub || '');
    }
  }, [data, id]);

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      onChange(id, e.target.value);
    },
    [id, onChange]
  );

  const handleSelectChange = (selectedOption: SelectOption | null) => {
    if (!selectedOption) {
      return;
    }

    onChange(id, selectedOption.value);
  };

  const handlePlaceChange = (selectedOption: SelectOption | null, isMain: boolean) => {
    if (!selectedOption) {
      if (isMain) {
        setMainPlace('');
        setSubPlace('');
      } else {
        setSubPlace('');
      }
      return;
    }

    if (isMain) {
      setMainPlace(selectedOption.value);
      setSubPlace('');
    } else {
      setSubPlace(selectedOption.value);
    }
  };

  useEffect(() => {
    if (id !== 'place') {
      return;
    }

    onChange(id, `${mainPlace} ${subPlace}`.trim());
  }, [mainPlace, subPlace, id, onChange]);

  const stringOptions = options.filter((item): item is string => typeof item === 'string');
  const placeOptions = options.filter((item): item is PlaceEntry => Array.isArray(item));
  const selectOptions: SelectOption[] = stringOptions.map((item) => ({ value: item, label: item }));
  const mainPlaceOptions: SelectOption[] = placeOptions.map(([item]) => ({
    value: item,
    label: item,
  }));
  const subPlaceSelectOptions = placeOptions.find(([item]) => item === mainPlace)?.[1] ?? [];
  const subPlaceOptions: SelectOption[] = subPlaceSelectOptions.map((item) => ({
    value: item,
    label: item,
  }));

  return (
    <div
      className={cx(
        styles.root,
        id === 'introduce' && styles['root--introduce']
      )}
    >
      {isNativeInputField ? (
        <label className={styles.label} htmlFor={id}>
          {field}
          {['university', 'birthdate', 'introduce'].includes(id) && (
            <>
              <Info
                aria-hidden="true"
                data-tooltip-id={`${id}-tooltip`}
                data-tooltip-content={tooltipContent}
                className={styles.icon}
                size="1em"
              />
              <Tooltip className="my-profile-tooltip" id={`${id}-tooltip`} />
            </>
          )}
        </label>
      ) : (
        <span className={styles.label} id={labelId}>
          {field}
          {['university', 'birthdate', 'introduce'].includes(id) && (
            <>
              <Info
                aria-hidden="true"
                data-tooltip-id={`${id}-tooltip`}
                data-tooltip-content={tooltipContent}
                className={styles.icon}
                size="1em"
              />
              <Tooltip className="my-profile-tooltip" id={`${id}-tooltip`} />
            </>
          )}
        </span>
      )}

      {type === 'text' && (
        <input
          type="text"
          id={id}
          value={data || ''}
          onChange={handleChange}
          className={styles.input}
        />
      )}

      {type === 'date' && (
        <div className={styles.birthdate}>
          <input
            type="date"
            id={id}
            value={data || ''}
            onChange={handleChange}
            disabled={isDisabled}
            className={cx(
              styles.input,
              isDisabled && styles['input--disabled']
            )}
          />
          <span className={styles['birthdate-text']}>
            {data ? `${getAgeByBirthDate(data)}세` : ''}
          </span>
        </div>
      )}

      {type === 'radio' && (
        <fieldset className={styles['radio-group']} aria-labelledby={labelId}>
          <legend className="sr-only">{field}</legend>
          {stringOptions.map((it, idx) => (
            <div className={styles['radio-item']} key={idx}>
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
        </fieldset>
      )}

      {type === 'select' && ['mbti', 'university'].includes(id) && (
        <div className={styles.select}>
          <Select
            classNamePrefix="my-profile-select"
            inputId={id}
            instanceId={id}
            value={selectOptions.find((option) => option.value === data)}
            onChange={handleSelectChange}
            options={selectOptions}
            placeholder={`${id.toUpperCase()} 선택`}
            noOptionsMessage={() => ''}
            aria-labelledby={labelId}
          />
        </div>
      )}

      {type === 'select' && id === 'place' && (
        <fieldset className={styles.place} aria-labelledby={labelId}>
          <legend className="sr-only">{field}</legend>
          <Select
            classNamePrefix="my-profile-select"
            inputId={`${id}-main`}
            instanceId={`${id}-main`}
            value={mainPlaceOptions.find((option) => option.value === mainPlace)}
            onChange={(option) => handlePlaceChange(option, true)}
            options={mainPlaceOptions}
            placeholder="지역"
            noOptionsMessage={() => ''}
            aria-label="지역"
          />
          <Select
            classNamePrefix="my-profile-select"
            key={mainPlace}
            inputId={`${id}-detail`}
            instanceId={`${id}-detail`}
            value={subPlaceOptions.find((option) => option.value === subPlace)}
            onChange={(option) => handlePlaceChange(option, false)}
            options={subPlaceOptions}
            placeholder="세부 지역"
            noOptionsMessage={() => ''}
            isDisabled={!mainPlace}
            aria-label="세부 지역"
          />
        </fieldset>
      )}

      {type === 'textarea' && (
        <textarea
          id={id}
          value={data || ''}
          onChange={handleChange}
          className={styles.textarea}
        />
      )}
    </div>
  );
};

export default React.memo(MyProfileForm);
