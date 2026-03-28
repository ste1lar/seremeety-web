import type { ConfirmationResult, RecaptchaVerifier } from 'firebase/auth';

declare global {
  interface Window {
    confirmationResult?: ConfirmationResult;
    recaptchaVerifier?: RecaptchaVerifier;
  }
}
