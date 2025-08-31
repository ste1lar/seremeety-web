import './Request.css';
import { useContext, useState } from 'react';
import { RequestStateContext } from '../../contexts/RequestContext';
import RequestHeader from '../../components/request/RequestHeader';
import RequestContent from '../../components/request/RequestContent';

const Request = () => {
  const state = useContext(RequestStateContext);
  const [isReceived, setIsReceived] = useState(true);
  console.log(state);

  return (
    <div className="request">
      <RequestHeader isReceived={isReceived} setIsReceived={setIsReceived} />
      <RequestContent requests={state} isReceived={isReceived} />
    </div>
  );
};

export default Request;
