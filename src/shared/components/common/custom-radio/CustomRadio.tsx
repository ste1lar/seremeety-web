import type { ChangeEventHandler } from 'react';

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
      className={['custom-radio', checked && 'custom-radio--checked', disabled && 'custom-radio--disabled']
        .filter(Boolean)
        .join(' ')}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
      />
      <span className="custom-radio__circle">
        <span className="custom-radio__check" />
      </span>
      <span className="custom-radio__label">{label}</span>
    </label>
  );
};

export default CustomRadio;
