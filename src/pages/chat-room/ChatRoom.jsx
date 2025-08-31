import './ChatRoom.css';
import { useNavigate, useParams } from 'react-router-dom';
import { useContext, useEffect, useState } from 'react';
import { getChatRoomById, getUserDataByUid, subscribeToChatRoomMessages } from '../../utils';
import { auth } from '../../firebase';
import Swal from 'sweetalert2';
import ChatRoomHeader from '../../components/chat-room/ChatRoomHeader';
import ChatRoomContent from '../../components/chat-room/ChatRoomContent';
import ChatRoomInput from '../../components/chat-room/ChatRoomInput';
import PageTransition from '../../components/common/PageTransition';
import Loading from '../../components/common/loading/Loading';
import { ChatDispatchContext } from '../../contexts/ChatContext';

const ChatRoom = () => {
  const { chatRoomId } = useParams();
  const [chatRoomMessages, setChatRoomMessages] = useState([]);
  const [otherUserData, setOtherUserData] = useState({});
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const { onUpdate } = useContext(ChatDispatchContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchChatRoomData = async () => {
      try {
        const chatRoomData = await getChatRoomById(chatRoomId);

        if (!chatRoomData) {
          Swal.fire({
            title: '오류',
            text: '존재하지 않는 채팅방입니다',
            confirmButtonText: '확인',
            customClass: {
              confirmButton: 'no-focus-outline',
            },
            willClose: () => {
              navigate(-1, { replace: true });
            },
          });
          return;
        }

        setOtherUserData(
          await getUserDataByUid(
            chatRoomData.users[0] !== auth.currentUser.uid
              ? chatRoomData.users[0]
              : chatRoomData.users[1]
          )
        );
      } catch (error) {
        console.log(error);
      }
    };

    fetchChatRoomData();
    const unsubscribe = subscribeToChatRoomMessages(chatRoomId, (messages) => {
      setChatRoomMessages(messages);
      setIsDataLoaded(true);
    });

    return () => {
      console.log('unsubscribe to chat room messages');
      unsubscribe();
    };
  }, [chatRoomId]);

  if (!isDataLoaded) {
    return <Loading />;
  } else {
    return (
      <div className="chat-room">
        <PageTransition>
          <ChatRoomHeader nickname={otherUserData.nickname} />
          <ChatRoomContent
            chatRoomMessages={chatRoomMessages}
            nickname={otherUserData.nickname}
            profilePictureUrl={otherUserData.profilePictureUrl}
          />
          <ChatRoomInput onUpdateChatRoom={onUpdate} chatRoomId={chatRoomId} />
        </PageTransition>
      </div>
    );
  }
};

export default ChatRoom;
