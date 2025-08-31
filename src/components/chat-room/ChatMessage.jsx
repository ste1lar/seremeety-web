import React, { useState } from 'react';
import { formatTimeStampForMessage } from '../../utils';
import './ChatMessage.css';
import ImageLoading from '../common/image-loading/ImageLoading';
import { useNavigate } from 'react-router-dom';

const ChatMessage = ({ isMyMsg, sender, nickname, profilePictureUrl, text, sentAt }) => {
  const navigate = useNavigate();
  const [isImgLoaded, setIsImgLoaded] = useState(false);

  const handleProfilePictureClick = () => {
    navigate(`/profile/${sender}`, { state: { isViewOnly: true } });
  };

  return (
    <div
      className={['chat-message', isMyMsg ? 'chat-message--my' : 'chat-message--other'].join(' ')}
    >
      {!isMyMsg && (
        <div className="chat-message__image" onClick={handleProfilePictureClick}>
          {!isImgLoaded && <ImageLoading borderRadius={'50%'} />}
          <img
            alt="PROFILE"
            src={profilePictureUrl}
            onLoad={() => setIsImgLoaded(true)}
            style={{ display: !isImgLoaded ? 'none' : 'block' }}
          />
        </div>
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
