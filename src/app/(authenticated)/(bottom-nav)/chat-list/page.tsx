import ChatProvider from '@/features/chat/context/ChatContext';
import ChatListPage from '@/features/chat/ChatListPage';

export default function Page() {
  return (
    <ChatProvider>
      <ChatListPage />
    </ChatProvider>
  );
}
