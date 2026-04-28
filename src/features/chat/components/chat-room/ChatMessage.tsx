import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { formatTimeStampForMessage } from '@/shared/lib/format';
import { cx } from '@/shared/lib/classNames';
import sereMeetyLogo from '@/shared/assets/images/seremeety-logo.png';
import type { TimestampLike } from '@/shared/types/domain';
import styles from './ChatMessage.module.scss';

interface ChatMessageProps {
  isMyMsg: boolean;
  nickname: string;
  profilePictureUrl: string;
  sender: string;
  sentAt: TimestampLike;
  text: string;
}

const ChatMessage = ({
  isMyMsg,
  sender,
  nickname,
  profilePictureUrl,
  text,
  sentAt,
}: ChatMessageProps) => {
  const [imgError, setImgError] = useState(false);

  return (
    <div
      className={cx(
        styles.root,
        isMyMsg ? styles['root--my'] : styles['root--other']
      )}
    >
      {!isMyMsg && (
        <Link
          className={styles.avatar}
          href={`/profile/${sender}?viewOnly=1`}
          aria-label={`${nickname} 프로필 보기`}
        >
          <Image
            alt={`${nickname} 프로필 사진`}
            src={imgError ? sereMeetyLogo.src : profilePictureUrl}
            fill
            sizes="44px"
            onError={() => setImgError(true)}
          />
        </Link>
      )}
      <div className={styles.content}>
        {!isMyMsg && <p className={styles.nickname}>{nickname}</p>}
        <div className={styles.bubble}>{text}</div>
      </div>
      <div className={styles.timestamp}>{formatTimeStampForMessage(sentAt)}</div>
    </div>
  );
};

export default React.memo(ChatMessage);
