import Button from '@/shared/components/common/button/Button';
import Header from '@/shared/components/common/Header';
import type { Dispatch, SetStateAction } from 'react';

interface RequestHeaderProps {
  isReceived: boolean;
  setIsReceived: Dispatch<SetStateAction<boolean>>;
}

const RequestHeader = ({ isReceived, setIsReceived }: RequestHeaderProps) => {
  return (
    <Header
      variant="request"
      title="REQUEST"
      menuAriaLabel="요청 보기 메뉴"
      menu={
        <>
          <Button
            text="받은 요청"
            type={isReceived ? '' : 'light'}
            onClick={() => setIsReceived(true)}
          />
          <Button
            text="보낸 요청"
            type={isReceived ? 'light' : ''}
            onClick={() => setIsReceived(false)}
          />
        </>
      }
    />
  );
};

export default RequestHeader;
