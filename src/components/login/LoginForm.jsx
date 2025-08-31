import React from 'react';
import Button from '../common/button/Button';
import './LoginForm.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { icons } from '../../utils';

const LoginForm = ({ type, value, onChange, placeholder, maxLength, btnText, onSubmit }) => {
  return (
    <div className="login-form">
      <FontAwesomeIcon
        icon={type === 'tel' ? icons.faPhone : icons.faHashtag}
        className="login-form__icon"
      />
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
