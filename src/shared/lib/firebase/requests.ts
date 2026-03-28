import { addDoc, collection, doc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { db } from '@/firebase';
import { normalizeRequest } from '@/shared/lib/firebase/normalizers';
import type { NewMatchRequest, RequestState } from '@/shared/types/domain';

export const getRequests = async (uid: string): Promise<RequestState> => {
  const [receivedSnapshot, sentSnapshot] = await Promise.all([
    getDocs(query(collection(db, 'requests'), where('to', '==', uid))),
    getDocs(query(collection(db, 'requests'), where('from', '==', uid))),
  ]);

  return {
    receivedRequests: receivedSnapshot.docs.map((requestDoc) =>
      normalizeRequest(requestDoc.data(), requestDoc.id)
    ),
    sentRequests: sentSnapshot.docs.map((requestDoc) =>
      normalizeRequest(requestDoc.data(), requestDoc.id)
    ),
  };
};

export const isRequestExist = async (
  currentUserUid: string,
  otherUserUid: string
): Promise<boolean> => {
  const receivedSnapshot = await getDocs(
    query(
      collection(db, 'requests'),
      where('to', '==', currentUserUid),
      where('from', '==', otherUserUid)
    )
  );

  if (!receivedSnapshot.empty) {
    return true;
  }

  const sentSnapshot = await getDocs(
    query(
      collection(db, 'requests'),
      where('from', '==', currentUserUid),
      where('to', '==', otherUserUid)
    )
  );

  return !sentSnapshot.empty;
};

export const createRequest = async (newRequest: NewMatchRequest): Promise<string> => {
  const requestsRef = collection(db, 'requests');
  const docRef = await addDoc(requestsRef, newRequest);
  return docRef.id;
};

export const updateRequestById = async (
  requestId: string,
  data: Partial<NewMatchRequest>
): Promise<void> => {
  const requestsRef = collection(db, 'requests');
  await updateDoc(doc(requestsRef, requestId), data);
};
