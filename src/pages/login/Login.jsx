import './Login.css';
import { useCallback, useEffect, useRef, useState } from 'react';
import React from 'react';
import LoginLogo from '../../components/login/LoginLogo';
import { toIntlPhoneNumber, toLocalePhoneNumber } from '../../utils';
import { signInWithPhoneNumber } from 'firebase/auth';
import Swal from 'sweetalert2';
import { auth, setupRecaptchaVerifier } from '../../firebase';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { icons } from '../../utils';
import Button from '../../components/common/button/Button';

const Login = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const recaptchaRef = useRef(null);
  const appVerifier = window.recaptchaVerifier;

  useEffect(() => {
    if (recaptchaRef.current) {
      setupRecaptchaVerifier(recaptchaRef.current);
    }
  }, []);

  const handlePhoneNumberChange = useCallback((e) => {
    const input = e.target.value;
    if (/^[\d-]*$/.test(input)) {
      setPhoneNumber((prev) => toLocalePhoneNumber(input));
    }
  }, []);

  const handleCodeChange = useCallback((e) => {
    const input = e.target.value;
    if (/^\d*$/.test(input)) {
      setVerificationCode((prev) => input);
    }
  }, []);

  const handleSendCode = useCallback(async () => {
    if (!phoneNumber) {
      Swal.fire({
        title: '전화번호 입력',
        text: '전화번호를 입력해주세요',
        confirmButtonText: '확인',
        customClass: {
          confirmButton: 'no-focus-outline',
        },
      });
      return;
    }
    try {
      await appVerifier.render();
      const confirmationResult = await signInWithPhoneNumber(
        auth,
        toIntlPhoneNumber(phoneNumber),
        appVerifier
      );
      window.confirmationResult = confirmationResult;
      Swal.fire({
        title: '인증번호 전송',
        text: '인증번호가 전송되었습니다',
        confirmButtonText: '확인',
        customClass: {
          confirmButton: 'no-focus-outline',
        },
      });
    } catch (error) {
      console.log(error);
      Swal.fire({
        title: '인증번호 전송 실패',
        text: '잘못된 전화번호이거나 오류가 발생했습니다',
        confirmButtonText: '확인',
        customClass: {
          confirmButton: 'no-focus-outline',
        },
      });
    }
  }, [phoneNumber, appVerifier]);

  const handleVerifyCode = useCallback(async () => {
    if (!verificationCode) {
      Swal.fire({
        title: '인증번호 입력',
        text: '인증번호를 입력해주세요',
        confirmButtonText: '확인',
        customClass: {
          confirmButton: 'no-focus-outline',
        },
      });
      return;
    }

    if (!window.confirmationResult) {
      console.log('verification error');
      Swal.fire({
        title: '인증 실패',
        text: '인증에 오류가 발생했습니다',
        confirmButtonText: '확인',
        customClass: {
          confirmButton: 'no-focus-outline',
        },
      });
      return;
    }

    try {
      await window.confirmationResult.confirm(verificationCode);
      console.log('user login');
    } catch (error) {
      console.log(error);
      Swal.fire({
        title: '로그인 실패',
        text: '잘못된 인증번호이거나 오류가 발생했습니다',
        confirmButtonText: '확인',
        customClass: {
          confirmButton: 'no-focus-outline',
        },
      });
    }
  }, [verificationCode]);

  const handleNoAccountClick = useCallback(() => {
    Swal.fire({
      title: '안내 / お知らせ',
      html: `
        <div style="font-family: 'Noto Sans JP', 'Noto Sans KR'; text-align: left; padding: 0 1.5rem;">
          <p>테스트 번호 01011111111을 입력 후 인증 버튼을 누르세요. 인증번호 111111을 입력하면 로그인 가능합니다.</p>
          <p>テスト番号 01011111111 を入力し、認証ボタン を押していただきます。認証コード 111111 を入力いただくと、ログイン可能です。</p>
        </div>
      `,
      confirmButtonText: '확인',
      customClass: {
        confirmButton: 'no-focus-outline',
      },
    });
  }, []);

  return (
    <div className="login">
      <LoginLogo />
      <div className="login__form-wrapper">
        <div className="login__input-wrapper">
          <div className="login__input-box">
            <FontAwesomeIcon icon={icons.faPhone} className="login__icon" />
            <input
              className="login__input"
              id="phone"
              type="tel"
              value={phoneNumber}
              onChange={handlePhoneNumberChange}
              placeholder="전화번호"
              maxLength={13}
            />
          </div>

          <div className="login__input-box">
            <FontAwesomeIcon icon={icons.faHashtag} className="login__icon" />
            <input
              className="login__input"
              id="code"
              type="text"
              value={verificationCode}
              onChange={handleCodeChange}
              placeholder="인증번호"
              maxLength={6}
            />
          </div>
        </div>
        <div className="login__button-wrapper">
          <Button
            text={'인증 / 認証'}
            icon={icons.faKeySkeleton}
            type={'light'}
            onClick={handleSendCode}
          />
          <Button
            text={'로그인 / ログイン'}
            icon={icons.faLockKeyholeOpen}
            onClick={handleVerifyCode}
          />
        </div>
      </div>
      <div className="login__no-account" onClick={handleNoAccountClick}>
        테스트 로그인 안내 / テスト用ログインのご案内
      </div>
      <div ref={recaptchaRef} />
    </div>
  );
};

export default React.memo(Login);
