import ChatProvider from '@/features/chat/context/ChatContext';
import RequestProvider from '@/features/request/context/RequestContext';
import RequestPage from '@/features/request/RequestPage';

export default function Page() {
  return (
    <RequestProvider>
      <ChatProvider enableSubscription={false}>
        <RequestPage />
      </ChatProvider>
    </RequestProvider>
  );
}
