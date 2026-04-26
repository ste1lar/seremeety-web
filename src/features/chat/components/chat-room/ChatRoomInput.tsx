import { useState, type ChangeEvent } from 'react';
import { Send } from 'lucide-react';
import styles from './ChatRoomInput.module.scss';

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
    <div className={styles.root}>
      <label className="sr-only" htmlFor="chat-message-input">
        메시지 입력
      </label>
      <input
        id="chat-message-input"
        name="messageInput"
        type="text"
        value={chatMessage}
        onChange={handleInputMessage}
        className={styles.input}
        placeholder="메시지 입력"
      />
      {chatMessage.trim() !== '' && (
        <button
          className={styles.send}
          type="button"
          onClick={handleSendMessage}
          aria-label="메시지 보내기"
        >
          <Send aria-hidden="true" size="1em" />
        </button>
      )}
    </div>
  );
};

export default ChatRoomInput;
