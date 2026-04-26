'use client';

import { useContext, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { auth } from '@/firebase';
import ChatRoomHeader from '@/features/chat/components/chat-room/ChatRoomHeader';
import ChatRoomContent from '@/features/chat/components/chat-room/ChatRoomContent';
import ChatRoomInput from '@/features/chat/components/chat-room/ChatRoomInput';
import PageTransition from '@/shared/components/common/PageTransition';
import Loading from '@/shared/components/common/loading/Loading';
import { ChatDispatchContext } from '@/features/chat/context/ChatContext';
import Modal, { type ModalConfig } from '@/shared/components/common/modal/Modal';
import { getChatRoomById, subscribeToChatRoomMessages } from '@/shared/lib/firebase/chat';
import { getUserDataByUid } from '@/shared/lib/firebase/users';
import type { ChatMessageRecord, UserProfile } from '@/shared/types/domain';
import styles from './ChatRoomPage.module.scss';

const ChatRoomPage = () => {
  const { chatRoomId } = useParams<{ chatRoomId: string }>();
  const [chatRoomMessages, setChatRoomMessages] = useState<ChatMessageRecord[]>([]);
  const [otherUserData, setOtherUserData] = useState<UserProfile | null>(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [modal, setModal] = useState<ModalConfig | null>(null);

  const { onUpdate } = useContext(ChatDispatchContext);
  const router = useRouter();

  useEffect(() => {
    if (!chatRoomId || Array.isArray(chatRoomId)) {
      return;
    }

    const fetchChatRoomData = async () => {
      try {
        const chatRoomData = await getChatRoomById(chatRoomId);

        if (!chatRoomData) {
          setModal({
            actions: [{ label: '확인', onClick: () => router.back() }],
            closeOnBackdrop: false,
            description: '존재하지 않는 채팅방입니다',
            showCloseButton: false,
            title: '오류',
          });
          return;
        }

        const currentUid = auth.currentUser?.uid;
        if (!currentUid) {
          return;
        }

        const otherUserUid =
          chatRoomData.users[0] !== currentUid ? chatRoomData.users[0] : chatRoomData.users[1];
        const nextUserData = await getUserDataByUid(otherUserUid);
        setOtherUserData(nextUserData);
      } catch (error) {
        console.error(error);
      }
    };

    void fetchChatRoomData();
    const unsubscribe = subscribeToChatRoomMessages(chatRoomId, (messages) => {
      setChatRoomMessages(messages);
      setIsDataLoaded(true);
    });

    return () => {
      unsubscribe();
    };
  }, [chatRoomId, router]);

  const isRoomLoading =
    !isDataLoaded || !chatRoomId || Array.isArray(chatRoomId) || !otherUserData;

  return (
    <section className={styles.root} aria-labelledby="chat-room-heading">
      <PageTransition>
        <ChatRoomHeader nickname={otherUserData?.nickname ?? '채팅'} />
        {isRoomLoading ? (
          <Loading className={styles.loading} />
        ) : (
          <>
            <ChatRoomContent
              chatRoomMessages={chatRoomMessages}
              nickname={otherUserData.nickname}
              profilePictureUrl={otherUserData.profilePictureUrl}
            />
            <ChatRoomInput onUpdateChatRoom={onUpdate} chatRoomId={chatRoomId} />
          </>
        )}
      </PageTransition>
      <Modal
        open={modal !== null}
        title={modal?.title ?? ''}
        description={modal?.description}
        actions={modal?.actions}
        closeOnBackdrop={modal?.closeOnBackdrop}
        showCloseButton={modal?.showCloseButton}
        onClose={() => setModal(null)}
      >
        {modal?.children}
      </Modal>
    </section>
  );
};

export default ChatRoomPage;
