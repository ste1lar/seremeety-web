import { useContext, useEffect, useState, type CSSProperties } from 'react';
import { MessagesSquare } from 'lucide-react';
import { auth } from '@/firebase';
import { ChatLoadingContext } from '@/features/chat/context/ChatContext';
import { getUserDataByUid } from '@/shared/lib/firebase/users';
import Loading from '@/shared/components/common/loading/Loading';
import ChatRoomItem from './ChatRoomItem';
import EmptyState from '@/shared/components/common/empty-state/EmptyState';
import type { ChatRoomRecord, EnhancedChatRoom } from '@/shared/types/domain';

interface ChatListContentProps {
  chatRooms: ChatRoomRecord[];
  style?: CSSProperties;
}

const ChatListContent = ({ chatRooms, style }: ChatListContentProps) => {
  const isChatLoading = useContext(ChatLoadingContext);
  const [enhancedChatRooms, setEnhancedChatRooms] = useState<EnhancedChatRoom[]>([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const addProfileDataInChatRooms = async (
    chatRoom: ChatRoomRecord
  ): Promise<EnhancedChatRoom | ChatRoomRecord> => {
    const currentUid = auth.currentUser?.uid;
    if (!currentUid) {
      return chatRoom;
    }

    const otherUserUid =
      chatRoom.users[0] !== currentUid ? chatRoom.users[0] : chatRoom.users[1];

    try {
      const otherUserData = await getUserDataByUid(otherUserUid);
      if (!otherUserData) {
        return chatRoom;
      }

      return {
        ...chatRoom,
        nickname: otherUserData.nickname,
        profilePictureUrl: otherUserData.profilePictureUrl,
      };
    } catch (error) {
      console.error(error);
      return chatRoom;
    }
  };

  useEffect(() => {
    const enhanceChatRooms = async () => {
      setIsDataLoaded(false);
      const nextChatRooms = await Promise.all(chatRooms.map(addProfileDataInChatRooms));
      setEnhancedChatRooms(
        nextChatRooms.filter(
          (chatRoom): chatRoom is EnhancedChatRoom =>
            'nickname' in chatRoom && 'profilePictureUrl' in chatRoom
        )
      );
      setIsDataLoaded(true);
    };

    void enhanceChatRooms();
  }, [chatRooms]);

  if (isChatLoading || !isDataLoaded) {
    return <Loading className="chat-list-content__loading" />;
  } else {
    return (
      <div className="chat-list-content" style={style}>
        {chatRooms.length <= 0 ? (
          <EmptyState icon={MessagesSquare} message={'아직 진행 중인 채팅이 없어요'} />
        ) : (
          <ul className="chat-list-content__list">
            {enhancedChatRooms.map((chatRoom) => (
              <li className="chat-list-content__item" key={chatRoom.id}>
                <ChatRoomItem {...chatRoom} />
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }
};

export default ChatListContent;
