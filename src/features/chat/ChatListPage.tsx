'use client';

import { useContext } from 'react';
import ChatListHeader from '@/features/chat/components/chat-list/ChatListHeader';
import ChatListContent from '@/features/chat/components/chat-list/ChatListContent';
import { ChatStateContext } from '@/features/chat/context/ChatContext';

const ChatListPage = () => {
  const state = useContext(ChatStateContext);

  return (
    <div className="chat-list">
      <ChatListHeader />
      <ChatListContent chatRooms={state} />
    </div>
  );
};

export default ChatListPage;
