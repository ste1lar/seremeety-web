import { useCallback, useContext, useEffect, useState, type CSSProperties } from 'react';
import { HandHeart } from 'lucide-react';
import RequestItem from './RequestItem';
import { getUserDataByUid } from '@/shared/lib/firebase/users';
import {
  RequestDispatchContext,
  RequestLoadingContext,
} from '@/features/request/context/RequestContext';
import { ChatDispatchContext } from '@/features/chat/context/ChatContext';
import Loading from '@/shared/components/common/loading/Loading';
import EmptyState from '@/shared/components/common/empty-state/EmptyState';
import type { EnhancedMatchRequest, RequestState } from '@/shared/types/domain';
import styles from './RequestContent.module.scss';

interface RequestContentProps {
  requests: RequestState;
  isReceived: boolean;
  style?: CSSProperties;
}

const RequestContent = ({ requests, isReceived, style }: RequestContentProps) => {
  const { onUpdate } = useContext(RequestDispatchContext);
  const isRequestLoading = useContext(RequestLoadingContext);
  const { onCreate } = useContext(ChatDispatchContext);
  const [enhancedRequests, setEnhancedRequests] = useState<EnhancedMatchRequest[]>([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const addProfileDataInRequest = useCallback(
    async (request: RequestState['receivedRequests'][number]): Promise<EnhancedMatchRequest | null> => {
      const otherUserUid = isReceived ? request.from : request.to;
      try {
        const otherUserData = await getUserDataByUid(otherUserUid);
        if (!otherUserData) {
          return null;
        }

        return {
          ...request,
          nickname: otherUserData.nickname,
          profilePictureUrl: otherUserData.profilePictureUrl,
          isReceived,
        };
      } catch (error) {
        console.error(error);
        return null;
      }
    },
    [isReceived]
  );

  useEffect(() => {
    const enhanceRequests = async () => {
      const sortedRequests = isReceived ? requests.receivedRequests : requests.sentRequests;
      setIsDataLoaded(false);
      const nextRequests = await Promise.all(sortedRequests.map(addProfileDataInRequest));
      setEnhancedRequests(
        nextRequests.filter((request): request is EnhancedMatchRequest => request !== null)
      );
      setIsDataLoaded(true);
    };

    void enhanceRequests();
  }, [addProfileDataInRequest, requests, isReceived]);

  if (isRequestLoading || !isDataLoaded) {
    return <Loading className={styles.loading} />;
  } else {
    return (
      <div className={styles.root} style={style}>
        {enhancedRequests.length <= 0 ? (
          <EmptyState
            icon={HandHeart}
            message={isReceived ? '아직 받은 요청이 없어요' : '아직 보낸 요청이 없어요'}
          />
        ) : (
          <ul className={styles.list}>
            {enhancedRequests.map((it) => (
              <li key={it.id}>
                <RequestItem request={it} onUpdateRequest={onUpdate} onCreateChatRoom={onCreate} />
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }
};

export default RequestContent;
