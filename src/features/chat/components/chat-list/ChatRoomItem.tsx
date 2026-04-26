import Image from 'next/image';
import Link from 'next/link';
import { formatTimeStampForList } from '@/shared/lib/format';
import ImageLoading from '@/shared/components/common/image-loading/ImageLoading';
import { useState } from 'react';
import type { EnhancedChatRoom } from '@/shared/types/domain';
import styles from './ChatRoomItem.module.scss';

const ChatRoomItem = ({ id, nickname, profilePictureUrl, lastMessage }: EnhancedChatRoom) => {
  const [isImgLoaded, setIsImgLoaded] = useState(false);
  const chatRoomHref = `/chat-room/${id}`;

  return (
    <Link className={styles.root} href={chatRoomHref}>
      <figure className={styles.avatar}>
        {!isImgLoaded && <ImageLoading borderRadius={'50%'} />}
        <Image
          alt={`${nickname} 프로필 사진`}
          src={profilePictureUrl}
          fill
          sizes="64px"
          onLoad={() => setIsImgLoaded(true)}
          style={{ display: !isImgLoaded ? 'none' : 'block' }}
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
