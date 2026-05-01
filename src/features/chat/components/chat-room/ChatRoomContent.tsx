import { useEffect, useRef, useState } from 'react';
import { auth } from '@/firebase';
import ChatMessage from './ChatMessage';
import { useInView } from '@/shared/hooks/useInView';
import { formatDateLabel, isSameDate } from '@/shared/lib/format';
import type { ReactNode } from 'react';
import type { ChatMessageRecord } from '@/shared/types/domain';
import styles from './ChatRoomContent.module.scss';

interface ChatRoomContentProps {
  chatRoomMessages: ChatMessageRecord[];
  nickname: string;
  profilePictureUrl: string;
}

const ChatRoomContent = ({
  chatRoomMessages,
  nickname,
  profilePictureUrl,
}: ChatRoomContentProps) => {
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [visibleCount, setVisibleCount] = useState(20);
  const [prevHeight, setPrevHeight] = useState(0);

  const visibleCountRef = useRef(visibleCount);
  const currentUserUid = auth.currentUser?.uid ?? '';
  const [ref, inView] = useInView<HTMLDivElement>();

  useEffect(() => {
    if (chatRoomMessages.length > 0) {
      setTimeout(() => {
        window.scrollTo({
          top: document.documentElement.scrollHeight,
          behavior: 'auto',
        });
        setIsFirstLoad(false);
      }, 100);
    }
  }, [chatRoomMessages, isFirstLoad]);

  useEffect(() => {
    if (!isFirstLoad && inView && visibleCountRef.current < chatRoomMessages.length) {
      setPrevHeight(document.documentElement.scrollHeight);
      setVisibleCount((prevCount) => Math.min(prevCount + 20, chatRoomMessages.length));
    }
  }, [chatRoomMessages.length, inView, isFirstLoad]);

  useEffect(() => {
    if (prevHeight > 0) {
      requestAnimationFrame(() => {
        const newHeight = document.documentElement.scrollHeight;
        const scrollOffset = newHeight - prevHeight;
        window.scrollBy(0, scrollOffset);
      });
    }
  }, [prevHeight]);

  useEffect(() => {
    visibleCountRef.current = visibleCount;
  }, [visibleCount]);

  return (
    <div className={styles.root}>
      <div ref={ref} />
      {chatRoomMessages &&
        chatRoomMessages.slice(-visibleCount).reduce<ReactNode[]>((acc, message, index, arr) => {
          const prev = arr[index - 1];
          const isNewDate = !prev || !isSameDate(prev.sentAt, message.sentAt);

          if (isNewDate) {
            acc.push(
              <div key={`date-${message.id}`} className={styles['date-label']}>
                {formatDateLabel(message.sentAt)}
              </div>
            );
          }

          acc.push(
            <ChatMessage
              key={message.id}
              {...message}
              isMyMsg={message.sender === currentUserUid}
              nickname={nickname}
              profilePictureUrl={profilePictureUrl}
            />
          );
          return acc;
        }, [])}
    </div>
  );
};

export default ChatRoomContent;
