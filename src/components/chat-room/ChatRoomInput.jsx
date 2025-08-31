import { useState } from 'react';
import './ChatRoomInput.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { icons } from '../../utils';

const ChatRoomInput = ({ onUpdateChatRoom, chatRoomId }) => {
  const [chatMessage, setChatMessage] = useState('');

  const handleInputMessage = (e) => {
    setChatMessage(e.target.value);
  };

  // 메시지 전송
  const handleSendMessage = async () => {
    await onUpdateChatRoom(chatMessage, chatRoomId);
    setChatMessage('');
  };

  return (
    <div className="chat-room-input">
      <input
        name="messageInput"
        type="text"
        value={chatMessage}
        onChange={handleInputMessage}
        className="chat-room-input__field"
        placeholder="메시지 입력"
      />
      {chatMessage.trim() !== '' && (
        <div className="chat-room-input__icon" onClick={handleSendMessage}>
          <FontAwesomeIcon icon={icons.faPaperPlane} />
        </div>
      )}
    </div>
  );
};

export default ChatRoomInput;
