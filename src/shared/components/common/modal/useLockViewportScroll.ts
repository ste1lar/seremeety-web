'use client';

import { useEffect } from 'react';

const LOCK_CLASS_NAME = 'common-modal-open';

const toggleScrollLock = (method: 'add' | 'remove') => {
  document.documentElement.classList[method](LOCK_CLASS_NAME);
  document.body.classList[method](LOCK_CLASS_NAME);
};

const useLockViewportScroll = (locked: boolean) => {
  useEffect(() => {
    if (!locked) {
      return;
    }

    toggleScrollLock('add');

    return () => {
      toggleScrollLock('remove');
    };
  }, [locked]);
};

export default useLockViewportScroll;
