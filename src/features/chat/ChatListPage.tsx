'use client';

import { useContext } from 'react';
import ChatListHeader from '@/features/chat/components/chat-list/ChatListHeader';
import ChatListContent from '@/features/chat/components/chat-list/ChatListContent';
import { ChatStateContext } from '@/features/chat/context/ChatContext';
import styles from './ChatListPage.module.scss';

const ChatListPage = () => {
  const state = useContext(ChatStateContext);

  return (
    <section className={styles.root} aria-labelledby="chat-list-heading">
      <ChatListHeader />
      <ChatListContent chatRooms={state} />
    </section>
  );
};

export default ChatListPage;
