'use client';

import React, { useEffect, useReducer, useState, type ReactNode } from 'react';
import { serverTimestamp } from 'firebase/firestore';
import { auth } from '@/firebase';
import { createChatRoom, createMessage, subscribeToChatRooms } from '@/shared/lib/firebase/chat';
import { toComparableTime } from '@/shared/lib/format';
import {
  type ChatRoomRecord,
  type NewChatMessage,
  type NewChatRoom,
} from '@/shared/types/domain';

interface ChatAction {
  type: 'INIT' | 'CREATE' | 'UPDATE';
  data: ChatRoomRecord[];
}

interface ChatDispatchValue {
  onCreate: (currentUserUid: string, otherUserUid: string) => Promise<void>;
  onUpdate: (text: string, chatRoomId: string) => Promise<void>;
}

const defaultChatDispatch: ChatDispatchValue = {
  onCreate: async () => undefined,
  onUpdate: async () => undefined,
};

export const ChatStateContext = React.createContext<ChatRoomRecord[]>([]);
export const ChatLoadingContext = React.createContext(true);
export const ChatDispatchContext = React.createContext<ChatDispatchValue>(defaultChatDispatch);

const reducer = (_state: ChatRoomRecord[], action: ChatAction): ChatRoomRecord[] => action.data;

interface ChatProviderProps {
  children: ReactNode;
  enableSubscription?: boolean;
}

export const ChatProvider = ({ children, enableSubscription = true }: ChatProviderProps) => {
  const [state, dispatch] = useReducer(reducer, [] as ChatRoomRecord[]);
  const [isLoading, setIsLoading] = useState(enableSubscription);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    if (enableSubscription) {
      setIsLoading(true);
      unsubscribe = subscribeToChatRooms(
        (chatRooms) => {
          dispatch({
            type: 'INIT',
            data: chatRooms,
          });
        },
        () => setIsLoading(false)
      );
    } else {
      setIsLoading(false);
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [enableSubscription]);

  const onCreate = async (currentUserUid: string, otherUserUid: string) => {
    const now = new Date();
    const newChatRoom: ChatRoomRecord = {
      id: '',
      createdAt: now,
      lastMessage: { sentAt: now, text: '' },
      users: [currentUserUid, otherUserUid],
    };

    try {
      const newChatRoomId = await createChatRoom({
        createdAt: serverTimestamp(),
        lastMessage: { sentAt: serverTimestamp(), text: '' },
        users: newChatRoom.users,
      } satisfies NewChatRoom);

      dispatch({
        type: 'CREATE',
        data: [...state, { ...newChatRoom, id: newChatRoomId }].sort(
          (left, right) =>
            toComparableTime(right.lastMessage.sentAt) - toComparableTime(left.lastMessage.sentAt)
        ),
      });
    } catch (error) {
      console.error(error);
    }
  };

  const onUpdate = async (text: string, chatRoomId: string) => {
    const currentUid = auth.currentUser?.uid;
    if (!currentUid) {
      return;
    }

    const newMessageData = {
      sender: currentUid,
      sentAt: new Date(),
      text,
    };

    try {
      await createMessage(chatRoomId, {
        ...newMessageData,
        sentAt: serverTimestamp(),
      } satisfies NewChatMessage);

      const updatedChatRooms = state
        .map((chatRoom) =>
          chatRoom.id === chatRoomId
            ? { ...chatRoom, lastMessage: { text, sentAt: newMessageData.sentAt } }
            : chatRoom
        )
        .sort(
          (left, right) =>
            toComparableTime(right.lastMessage.sentAt) - toComparableTime(left.lastMessage.sentAt)
        );

      dispatch({
        type: 'UPDATE',
        data: updatedChatRooms,
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <ChatLoadingContext.Provider value={isLoading}>
      <ChatStateContext.Provider value={state}>
        <ChatDispatchContext.Provider value={{ onCreate, onUpdate }}>
          {children}
        </ChatDispatchContext.Provider>
      </ChatStateContext.Provider>
    </ChatLoadingContext.Provider>
  );
};

export default ChatProvider;
