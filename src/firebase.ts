import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth, RecaptchaVerifier } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? 'demo-api-key',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? 'demo.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? 'demo-project',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? 'demo.appspot.com',
  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '000000000000',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? '1:000000000000:web:demo',
};

const missingConfig = Object.entries(firebaseConfig)
  .filter(([, value]) => value.startsWith('demo') || value === '000000000000')
  .map(([key]) => key);

if (missingConfig.length > 0 && typeof window !== 'undefined') {
  console.warn(
    `[firebase] Missing NEXT_PUBLIC Firebase env vars: ${missingConfig.join(', ')}. ` +
      'Add them to your environment before using auth, Firestore, or Storage.'
  );
}

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export const setupRecaptchaVerifier = (container: HTMLElement) => {
  if (typeof window === 'undefined' || !container) {
    return null;
  }

  if (window.recaptchaVerifier) {
    return window.recaptchaVerifier;
  }

  window.recaptchaVerifier = new RecaptchaVerifier(auth, container, {
    size: 'invisible',
  });

  return window.recaptchaVerifier;
};
