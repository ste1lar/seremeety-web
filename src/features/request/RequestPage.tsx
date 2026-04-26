'use client';

import { useContext, useState } from 'react';
import { RequestStateContext } from '@/features/request/context/RequestContext';
import RequestHeader from '@/features/request/components/request/RequestHeader';
import RequestContent from '@/features/request/components/request/RequestContent';
import styles from './RequestPage.module.scss';

const RequestPage = () => {
  const state = useContext(RequestStateContext);
  const [isReceived, setIsReceived] = useState(true);

  return (
    <section className={styles.root} aria-labelledby="request-heading">
      <RequestHeader isReceived={isReceived} setIsReceived={setIsReceived} />
      <RequestContent requests={state} isReceived={isReceived} />
    </section>
  );
};

export default RequestPage;
