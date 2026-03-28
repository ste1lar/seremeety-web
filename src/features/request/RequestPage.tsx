'use client';

import { useContext, useState } from 'react';
import { RequestStateContext } from '@/features/request/context/RequestContext';
import RequestHeader from '@/features/request/components/request/RequestHeader';
import RequestContent from '@/features/request/components/request/RequestContent';

const RequestPage = () => {
  const state = useContext(RequestStateContext);
  const [isReceived, setIsReceived] = useState(true);

  return (
    <div className="request">
      <RequestHeader isReceived={isReceived} setIsReceived={setIsReceived} />
      <RequestContent requests={state} isReceived={isReceived} />
    </div>
  );
};

export default RequestPage;
