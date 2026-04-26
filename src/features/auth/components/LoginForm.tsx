import React from 'react';
import { Hash, Phone } from 'lucide-react';
import Button from '@/shared/components/common/button/Button';
import type {
  ChangeEventHandler,
  HTMLInputTypeAttribute,
  MouseEventHandler,
} from 'react';
import styles from './LoginForm.module.scss';

interface LoginFormProps {
  btnText: string;
  maxLength?: number;
  onChange: ChangeEventHandler<HTMLInputElement>;
  onSubmit?: MouseEventHandler<HTMLButtonElement>;
  placeholder?: string;
  type: HTMLInputTypeAttribute;
  value: string;
}

const LoginForm = ({
  type,
  value,
  onChange,
  placeholder,
  maxLength,
  btnText,
  onSubmit,
}: LoginFormProps) => {
  const InputIcon = type === 'tel' ? Phone : Hash;
  const inputName = type === 'tel' ? 'phoneNumber' : 'verificationCode';

  return (
    <div className={styles.root}>
      <InputIcon aria-hidden="true" className={styles.icon} size="1em" />
      <label className="sr-only" htmlFor={inputName}>
        {placeholder ?? btnText}
      </label>
      <input
        className={styles.input}
        id={inputName}
        name={inputName}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        maxLength={maxLength}
      />
      <Button text={btnText} onClick={onSubmit} />
    </div>
  );
};

export default React.memo(LoginForm);
