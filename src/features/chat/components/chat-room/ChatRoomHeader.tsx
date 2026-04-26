import React from 'react';
import { ChevronLeft, Menu, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import styles from './ChatRoomHeader.module.scss';

interface ChatRoomHeaderProps {
  nickname: string;
}

const ChatRoomHeader = ({ nickname }: ChatRoomHeaderProps) => {
  const router = useRouter();

  return (
    <header className={styles.root}>
      <button
        className={styles.icon}
        type="button"
        onClick={() => router.back()}
        aria-label="뒤로 가기"
      >
        <ChevronLeft aria-hidden="true" size="1em" />
      </button>
      <p className={styles.title} id="chat-room-heading">{nickname}</p>
      <div className={styles.menu}>
        <button className={styles.icon} type="button" aria-label="메뉴">
          <Menu aria-hidden="true" size="1em" />
        </button>
        <button className={styles.icon} type="button" aria-label="검색">
          <Search aria-hidden="true" size="1em" />
        </button>
      </div>
    </header>
  );
};

export default React.memo(ChatRoomHeader);
