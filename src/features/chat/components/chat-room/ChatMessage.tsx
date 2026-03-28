import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatTimeStampForMessage } from '@/shared/lib/format';
import ImageLoading from '@/shared/components/common/image-loading/ImageLoading';
import type { TimestampLike } from '@/shared/types/domain';

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
  const router = useRouter();
  const [isImgLoaded, setIsImgLoaded] = useState(false);

  const handleProfilePictureClick = () => {
    router.push(`/profile/${sender}?viewOnly=1`);
  };

  return (
    <div
      className={['chat-message', isMyMsg ? 'chat-message--my' : 'chat-message--other'].join(' ')}
    >
      {!isMyMsg && (
        <button className="chat-message__image" type="button" onClick={handleProfilePictureClick}>
          {!isImgLoaded && <ImageLoading borderRadius={'50%'} />}
          <img
            alt="PROFILE"
            src={profilePictureUrl}
            onLoad={() => setIsImgLoaded(true)}
            style={{ display: !isImgLoaded ? 'none' : 'block' }}
          />
        </button>
      )}
      <div className="chat-message__content">
        {!isMyMsg && <div className="chat-message__nickname">{nickname}</div>}
        <div className="chat-message__text">{text}</div>
      </div>
      <div className="chat-message__timestamp">{formatTimeStampForMessage(sentAt)}</div>
    </div>
  );
};

export default React.memo(ChatMessage);
