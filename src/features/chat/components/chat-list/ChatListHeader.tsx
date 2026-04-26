import { Search } from 'lucide-react';
import Header from '@/shared/components/common/Header';

const ChatListHeader = () => {
  return (
    <Header
      variant="chat"
      title="CHATS"
      headingLevel="h1"
      titleId="chat-list-heading"
      menuAriaLabel="채팅 메뉴"
      menu={
        <>
          <button type="button" aria-label="검색">
            <Search aria-hidden="true" size="1em" />
          </button>
        </>
      }
    />
  );
};

export default ChatListHeader;
