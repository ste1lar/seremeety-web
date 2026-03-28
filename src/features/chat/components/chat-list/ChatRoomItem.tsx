import { useRouter } from 'next/navigation';
import { formatTimeStampForList } from '@/shared/lib/format';
import ImageLoading from '@/shared/components/common/image-loading/ImageLoading';
import { useState, type MouseEvent } from 'react';
import type { EnhancedChatRoom } from '@/shared/types/domain';

const ChatRoomItem = ({ id, nickname, profilePictureUrl, lastMessage }: EnhancedChatRoom) => {
  const [isImgLoaded, setIsImgLoaded] = useState(false);
  const router = useRouter();
  const chatRoomHref = `/chat-room/${id}`;

  const handleChatRoomClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    router.push(chatRoomHref);
  };

  return (
    <a className="chat-room-item" href={chatRoomHref} onClick={handleChatRoomClick}>
      <figure className="chat-room-item__image">
        {!isImgLoaded && <ImageLoading borderRadius={'50%'} />}
        <img
          alt={`${nickname} 프로필 사진`}
          src={profilePictureUrl}
          onLoad={() => setIsImgLoaded(true)}
          style={{ display: !isImgLoaded ? 'none' : 'block' }}
        />
      </figure>
      <div className="chat-room-item__content">
        <header className="chat-room-item__info">
          <strong className="chat-room-item__nickname">{nickname}</strong>
          <time className="chat-room-item__sent-at">{formatTimeStampForList(lastMessage.sentAt)}</time>
        </header>
        <p className="chat-room-item__message">{lastMessage.text}</p>
      </div>
    </a>
  );
};

export default ChatRoomItem;
