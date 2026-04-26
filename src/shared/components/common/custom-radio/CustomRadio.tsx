import type { ChangeEventHandler } from 'react';
import { cx } from '@/shared/lib/classNames';
import styles from './CustomRadio.module.scss';

interface CustomRadioProps {
  name: string;
  value: string;
  checked: boolean;
  onChange: ChangeEventHandler<HTMLInputElement>;
  label: string;
  disabled?: boolean;
}

const CustomRadio = ({
  name,
  value,
  checked,
  onChange,
  label,
  disabled = false,
}: CustomRadioProps) => {
  return (
    <label
      className={cx(
        styles['custom-radio'],
        checked && styles['custom-radio--checked'],
        disabled && styles['custom-radio--disabled']
      )}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
      />
      <span className={styles['custom-radio__circle']}>
        <span className={styles['custom-radio__check']} />
      </span>
      <span className={styles['custom-radio__label']}>{label}</span>
    </label>
  );
};

export default CustomRadio;
