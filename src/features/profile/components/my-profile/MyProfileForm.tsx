import React, { useCallback, useEffect, useMemo, useState, type ChangeEvent } from 'react';
import { Info } from 'lucide-react';
import CustomRadio from '@/shared/components/common/custom-radio/CustomRadio';
import Select, { type SelectOption } from '@/shared/components/common/select/Select';
import { getAgeByBirthDate } from '@/shared/lib/format';
import { cx } from '@/shared/lib/classNames';
import type {
  PlaceEntry,
  ProfileFieldId,
  ProfileFieldType,
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
  const hasHint = ['university', 'birthdate', 'introduce'].includes(id);
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

  const handleSelectChange = (next: string) => {
    onChange(id, next);
  };

  const handleMainPlaceChange = (next: string) => {
    setMainPlace(next);
    setSubPlace('');
  };

  const handleSubPlaceChange = (next: string) => {
    setSubPlace(next);
  };

  useEffect(() => {
    if (id !== 'place') {
      return;
    }

    onChange(id, `${mainPlace} ${subPlace}`.trim());
  }, [mainPlace, subPlace, id, onChange]);

  const stringOptions = options.filter((item): item is string => typeof item === 'string');
  const placeOptions = options.filter((item): item is PlaceEntry => Array.isArray(item));
  const stringSelectOptions: SelectOption[] = useMemo(
    () => stringOptions.map((option) => ({ value: option, label: option })),
    [stringOptions]
  );
  const mainPlaceSelectOptions: SelectOption[] = useMemo(
    () => placeOptions.map(([region]) => ({ value: region, label: region })),
    [placeOptions]
  );
  const subPlaceSelectOptions: SelectOption[] = useMemo(() => {
    const subList = placeOptions.find(([region]) => region === mainPlace)?.[1] ?? [];
    return subList.map((region) => ({ value: region, label: region }));
  }, [placeOptions, mainPlace]);

  const hint = hasHint ? (
    <span
      className={styles.hint}
      data-hint={tooltipContent}
      tabIndex={0}
      role="note"
      aria-label={tooltipContent}
    >
      <Info aria-hidden="true" className={styles.icon} size="1em" />
    </span>
  ) : null;

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
          {hint}
        </label>
      ) : (
        <span className={styles.label} id={labelId}>
          {field}
          {hint}
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
            id={id}
            value={data || ''}
            onChange={handleSelectChange}
            options={stringSelectOptions}
            placeholder={`${id.toUpperCase()} 선택`}
            aria-labelledby={labelId}
          />
        </div>
      )}

      {type === 'select' && id === 'place' && (
        <fieldset className={styles.place} aria-labelledby={labelId}>
          <legend className="sr-only">{field}</legend>
          <Select
            id={`${id}-main`}
            value={mainPlace}
            onChange={handleMainPlaceChange}
            options={mainPlaceSelectOptions}
            placeholder="지역"
            aria-label="지역"
          />
          <Select
            id={`${id}-detail`}
            value={subPlace}
            onChange={handleSubPlaceChange}
            options={subPlaceSelectOptions}
            placeholder="세부 지역"
            disabled={!mainPlace}
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
