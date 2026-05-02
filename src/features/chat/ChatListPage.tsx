'use client';

import ChatListHeader from '@/features/chat/components/chat-list/ChatListHeader';
import ChatListContent from '@/features/chat/components/chat-list/ChatListContent';
import { useGetChatRoomsQuery } from '@/shared/lib/api/chatApi';
import { useAppSelector } from '@/shared/lib/store/hooks';
import { selectAuthUid } from '@/shared/lib/store/authSlice';
import styles from './ChatListPage.module.scss';

const ChatListPage = () => {
  const uid = useAppSelector(selectAuthUid);
  const { data: chatRooms = [], isLoading } = useGetChatRoomsQuery(undefined, {
    skip: !uid,
  });

  return (
    <section className={styles.root} aria-labelledby="chat-list-heading">
      <ChatListHeader />
      <ChatListContent chatRooms={chatRooms} isLoading={isLoading} />
    </section>
  );
};

export default ChatListPage;
