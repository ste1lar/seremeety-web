import './ChatListContent.css';
import { useEffect, useState } from 'react';
import { auth } from '../../firebase';
import { getUserDataByUid, icons } from '../../utils';
import Loading from '../common/loading/Loading';
import ChatRoomItem from './ChatRoomItem';
import EmptyState from '../common/empty-state/EmptyState';

const ChatListContent = ({ chatRooms, style }) => {
  const [enhancedChatRooms, setEnhancedChatRooms] = useState([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const addProfileDataInChatRooms = async (chatRoom) => {
    const otherUserUid =
      chatRoom.users[0] !== auth.currentUser.uid ? chatRoom.users[0] : chatRoom.users[1];

    try {
      const otherUserData = await getUserDataByUid(otherUserUid);
      return {
        ...chatRoom,
        nickname: otherUserData.nickname,
        profilePictureUrl: otherUserData.profilePictureUrl,
      };
    } catch (error) {
      console.log(error);
      return chatRoom;
    }
  };

  useEffect(() => {
    const enhanceChatRooms = async () => {
      setEnhancedChatRooms(await Promise.all(chatRooms.map(addProfileDataInChatRooms)));
      setIsDataLoaded(true);
    };

    enhanceChatRooms();
  }, [chatRooms]);

  if (!isDataLoaded) {
    return <Loading />;
  } else {
    return (
      <div className="chat-list-content" style={style}>
        {chatRooms.length <= 0 ? (
          <EmptyState icon={icons.faComments} message={'아직 진행 중인 채팅이 없어요'} />
        ) : (
          enhancedChatRooms.map((it) => <ChatRoomItem key={it.id} {...it} />)
        )}
      </div>
    );
  }
};

export default ChatListContent;
