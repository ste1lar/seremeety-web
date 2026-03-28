import RequestProvider from '@/features/request/context/RequestContext';
import ProfilePage from '@/features/profile/ProfilePage';

export default function Page() {
  return (
    <RequestProvider>
      <ProfilePage />
    </RequestProvider>
  );
}
