import React from 'react';
import { Hash, Phone } from 'lucide-react';
import Button from '@/shared/components/common/button/Button';
import type {
  ChangeEventHandler,
  HTMLInputTypeAttribute,
  MouseEventHandler,
} from 'react';

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

  return (
    <div className="login-form">
      <InputIcon aria-hidden="true" className="login-form__icon" size="1em" />
      <input
        className="login-form__input"
        name={type === 'tel' ? 'phoneNumber' : 'verificationCode'}
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
