'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { auth } from '@/firebase';
import ChatRoomHeader from '@/features/chat/components/chat-room/ChatRoomHeader';
import ChatRoomContent from '@/features/chat/components/chat-room/ChatRoomContent';
import ChatRoomInput from '@/features/chat/components/chat-room/ChatRoomInput';
import PageTransition from '@/shared/components/common/PageTransition';
import Loading from '@/shared/components/common/loading/Loading';
import {
  useGetChatRoomMessagesQuery,
  useGetChatRoomQuery,
  useSendMessageMutation,
} from '@/shared/lib/api/chatApi';
import { useIsChatBlockedQuery } from '@/shared/lib/api/blockApi';
import Modal, { type ModalConfig } from '@/shared/components/common/modal/Modal';
import { getUserDataByUid } from '@/shared/lib/firebase/users';
import type { UserProfile } from '@/shared/types/domain';
import styles from './ChatRoomPage.module.scss';

const ChatRoomPage = () => {
  const { chatRoomId } = useParams<{ chatRoomId: string }>();
  const isRoomIdValid = Boolean(chatRoomId) && !Array.isArray(chatRoomId);
  const targetRoomId = isRoomIdValid ? (chatRoomId as string) : '';

  const [otherUserData, setOtherUserData] = useState<UserProfile | null>(null);
  const [otherUid, setOtherUid] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalConfig | null>(null);
  const router = useRouter();

  const { data: chatRoom, isLoading: isRoomLoading } = useGetChatRoomQuery(
    targetRoomId,
    { skip: !isRoomIdValid }
  );
  const { data: chatRoomMessages = [], isSuccess: isMessagesReady } =
    useGetChatRoomMessagesQuery(targetRoomId, { skip: !isRoomIdValid });
  const { data: isBlocked = false } = useIsChatBlockedQuery(otherUid ?? '', {
    skip: !otherUid,
  });
  const [sendMessage] = useSendMessageMutation();

  useEffect(() => {
    if (isRoomLoading || !isRoomIdValid) return;
    if (chatRoom === null) {
      setModal({
        actions: [{ label: '확인', onClick: () => router.back() }],
        closeOnBackdrop: false,
        description: '존재하지 않는 채팅방입니다',
        showCloseButton: false,
        title: '오류',
      });
    }
  }, [chatRoom, isRoomLoading, isRoomIdValid, router]);

  // 상대 사용자 프로필 fetch — 채팅방 데이터에서 다른 uid를 추출해 1회 fetch.
  // TODO(Phase 6 후속): profileApi.getPublicProfile로 마이그레이션 가능.
  useEffect(() => {
    if (!chatRoom) {
      setOtherUserData(null);
      setOtherUid(null);
      return;
    }
    const currentUid = auth.currentUser?.uid;
    if (!currentUid) return;

    const nextOtherUid =
      chatRoom.users[0] !== currentUid ? chatRoom.users[0] : chatRoom.users[1];
    setOtherUid(nextOtherUid);

    let cancelled = false;
    void getUserDataByUid(nextOtherUid).then((data) => {
      if (!cancelled) {
        setOtherUserData(data);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [chatRoom]);

  const handleSendMessage = async (text: string, roomId: string) => {
    if (isBlocked) {
      return;
    }
    try {
      await sendMessage({ chatRoomId: roomId, text }).unwrap();
    } catch (error) {
      console.error(error);
    }
  };

  const isContentLoading =
    isRoomLoading || !isMessagesReady || !isRoomIdValid || !otherUserData;

  return (
    <section className={styles.root} aria-labelledby="chat-room-heading">
      <PageTransition>
        <ChatRoomHeader nickname={otherUserData?.nickname ?? '채팅'} />
        {isContentLoading ? (
          <Loading className={styles.loading} />
        ) : (
          <>
            <ChatRoomContent
              chatRoomMessages={chatRoomMessages}
              nickname={otherUserData.nickname}
              profilePictureUrl={otherUserData.profilePictureUrl}
            />
            {isBlocked ? (
              <p className={styles.blockedNotice} role="status">
                차단된 사용자와는 메시지를 주고받을 수 없어요.
              </p>
            ) : (
              <ChatRoomInput
                onUpdateChatRoom={handleSendMessage}
                chatRoomId={targetRoomId}
              />
            )}
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
