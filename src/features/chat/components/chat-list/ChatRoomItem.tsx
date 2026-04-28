import Image from 'next/image';
import Link from 'next/link';
import { formatTimeStampForList } from '@/shared/lib/format';
import { useState } from 'react';
import sereMeetyLogo from '@/shared/assets/images/seremeety-logo.png';
import type { EnhancedChatRoom } from '@/shared/types/domain';
import styles from './ChatRoomItem.module.scss';

const ChatRoomItem = ({ id, nickname, profilePictureUrl, lastMessage }: EnhancedChatRoom) => {
  const [imgError, setImgError] = useState(false);
  const chatRoomHref = `/chat-room/${id}`;

  return (
    <Link className={styles.root} href={chatRoomHref}>
      <figure className={styles.avatar}>
        <Image
          alt={`${nickname} 프로필 사진`}
          src={imgError ? sereMeetyLogo.src : profilePictureUrl}
          fill
          loading="eager"
          sizes="64px"
          onError={() => setImgError(true)}
        />
      </figure>
      <div className={styles.content}>
        <header className={styles.info}>
          <strong className={styles.nickname}>{nickname}</strong>
          <time className={styles.timestamp}>{formatTimeStampForList(lastMessage.sentAt)}</time>
        </header>
        <p className={styles.message}>{lastMessage.text}</p>
      </div>
    </Link>
  );
};

export default ChatRoomItem;
