import { useState, type ChangeEvent } from 'react';
import { Send } from 'lucide-react';

interface ChatRoomInputProps {
  chatRoomId: string;
  onUpdateChatRoom: (text: string, chatRoomId: string) => Promise<void>;
}

const ChatRoomInput = ({ onUpdateChatRoom, chatRoomId }: ChatRoomInputProps) => {
  const [chatMessage, setChatMessage] = useState('');

  const handleInputMessage = (event: ChangeEvent<HTMLInputElement>) => {
    setChatMessage(event.target.value);
  };

  const handleSendMessage = async () => {
    const trimmedMessage = chatMessage.trim();
    if (!trimmedMessage) {
      return;
    }

    await onUpdateChatRoom(trimmedMessage, chatRoomId);
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
        <button className="chat-room-input__icon" type="button" onClick={handleSendMessage}>
          <Send aria-hidden="true" size="1em" />
        </button>
      )}
    </div>
  );
};

export default ChatRoomInput;
