'use client';

import React, { useEffect, useReducer, useState, type ReactNode } from 'react';
import { serverTimestamp } from 'firebase/firestore';
import { auth } from '@/firebase';
import { emptyRequestState } from '@/shared/lib/constants';
import { toComparableTime } from '@/shared/lib/format';
import {
  createRequest,
  getRequests,
  updateRequestById,
} from '@/shared/lib/firebase/requests';
import type { MatchRequest, NewMatchRequest, RequestState } from '@/shared/types/domain';

interface RequestAction {
  type: 'INIT' | 'CREATE' | 'UPDATE';
  data: RequestState;
}

interface RequestDispatchValue {
  onCreate: (currentUserUid: string, otherUserUid: string) => Promise<void>;
  onUpdate: (requestId: string, updatedRequest: MatchRequest) => Promise<void>;
}

const defaultRequestDispatch: RequestDispatchValue = {
  onCreate: async () => undefined,
  onUpdate: async () => undefined,
};

export const RequestStateContext = React.createContext<RequestState>(emptyRequestState);
export const RequestLoadingContext = React.createContext(true);
export const RequestDispatchContext =
  React.createContext<RequestDispatchValue>(defaultRequestDispatch);

const reducer = (_state: RequestState, action: RequestAction): RequestState => action.data;

interface RequestProviderProps {
  children: ReactNode;
}

export const RequestProvider = ({ children }: RequestProviderProps) => {
  const [state, dispatch] = useReducer(reducer, emptyRequestState);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      const currentUid = auth.currentUser?.uid;
      if (!currentUid) {
        setIsLoading(false);
        return;
      }

      try {
        const requests = await getRequests(currentUid);
        dispatch({
          type: 'INIT',
          data: {
            receivedRequests: [...requests.receivedRequests].sort(
              (left, right) => toComparableTime(right.createdAt) - toComparableTime(left.createdAt)
            ),
            sentRequests: [...requests.sentRequests].sort(
              (left, right) => toComparableTime(right.createdAt) - toComparableTime(left.createdAt)
            ),
          },
        });
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchRequests();
  }, []);

  const onCreate = async (currentUserUid: string, otherUserUid: string) => {
    const newRequest: MatchRequest = {
      createdAt: new Date(),
      from: currentUserUid,
      id: '',
      status: 'pending',
      to: otherUserUid,
    };

    try {
      const newRequestId = await createRequest({
        createdAt: serverTimestamp(),
        from: newRequest.from,
        status: newRequest.status,
        to: newRequest.to,
      } satisfies NewMatchRequest);

      dispatch({
        type: 'CREATE',
        data: {
          ...state,
          sentRequests: [...state.sentRequests, { ...newRequest, id: newRequestId }].sort(
            (left, right) => toComparableTime(right.createdAt) - toComparableTime(left.createdAt)
          ),
        },
      });
    } catch (error) {
      console.error(error);
    }
  };

  const onUpdate = async (requestId: string, updatedRequest: MatchRequest) => {
    try {
      await updateRequestById(requestId, {
        createdAt: updatedRequest.createdAt,
        from: updatedRequest.from,
        status: updatedRequest.status,
        to: updatedRequest.to,
      });

      dispatch({
        type: 'UPDATE',
        data: {
          ...state,
          receivedRequests: state.receivedRequests.map((request) =>
            request.id === requestId ? { ...updatedRequest, id: requestId } : request
          ),
        },
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <RequestLoadingContext.Provider value={isLoading}>
      <RequestStateContext.Provider value={state}>
        <RequestDispatchContext.Provider value={{ onCreate, onUpdate }}>
          {children}
        </RequestDispatchContext.Provider>
      </RequestStateContext.Provider>
    </RequestLoadingContext.Provider>
  );
};

export default RequestProvider;
