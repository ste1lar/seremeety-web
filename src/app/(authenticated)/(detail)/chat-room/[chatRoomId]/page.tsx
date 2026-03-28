import ChatProvider from '@/features/chat/context/ChatContext';
import ChatRoomPage from '@/features/chat/ChatRoomPage';

export default function Page() {
  return (
    <ChatProvider enableSubscription={false}>
      <ChatRoomPage />
    </ChatProvider>
  );
}
