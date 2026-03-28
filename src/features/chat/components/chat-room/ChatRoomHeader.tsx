import React from 'react';
import { ChevronLeft, Menu, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ChatRoomHeaderProps {
  nickname: string;
}

const ChatRoomHeader = ({ nickname }: ChatRoomHeaderProps) => {
  const router = useRouter();

  return (
    <header className="chat-room-header">
      <button className="chat-room-header__icon" type="button" onClick={() => router.back()}>
        <ChevronLeft aria-hidden="true" size="1em" />
      </button>
      <div className="chat-room-header__nickname">{nickname}</div>
      <div className="chat-room-header__menu">
        <Menu aria-hidden="true" className="chat-room-header__icon" size="1em" />
        <Search aria-hidden="true" className="chat-room-header__icon" size="1em" />
      </div>
    </header>
  );
};

export default React.memo(ChatRoomHeader);
