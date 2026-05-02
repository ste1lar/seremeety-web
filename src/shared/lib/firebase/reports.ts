import {
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '@/firebase';
import { toPlainTimestamps } from '@/shared/lib/firebase/serialize';
import type {
  Report,
  ReportStatus,
  ReportTargetType,
} from '@/shared/types/model/safety';

const COLLECTION = 'reports';

// 같은 사용자가 같은 타깃을 중복 신고하는 것을 막기 위해 deterministic doc id 사용.
// 사유가 바뀌어 재신고하면 마지막 사유로 덮어쓴다 (admin 입장에서 한 건만 보면 됨).
const reportKey = (
  reporterUserId: string,
  targetType: ReportTargetType,
  targetId: string
): string => `${reporterUserId}_${targetType}_${targetId}`;

interface NewReport {
  targetType: ReportTargetType;
  targetId: string;
  targetUserId?: string;
  reason: string;
  description?: string;
}

// TODO(Phase 3): Functions로 이동. reporter 검증 / 자기 자신 신고 차단 / rate limit는 서버에서.
export const createReport = async (
  reporterUserId: string,
  input: NewReport
): Promise<string> => {
  const id = reportKey(reporterUserId, input.targetType, input.targetId);
  const ref = doc(db, COLLECTION, id);
  await setDoc(ref, {
    reporterUserId,
    targetType: input.targetType,
    targetId: input.targetId,
    ...(input.targetUserId ? { targetUserId: input.targetUserId } : {}),
    reason: input.reason,
    ...(input.description ? { description: input.description } : {}),
    status: 'open',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return id;
};

// admin 큐용. status로 필터한 모든 신고.
export const getReportsByStatus = async (
  status: ReportStatus
): Promise<Report[]> => {
  const q = query(collection(db, COLLECTION), where('status', '==', status));
  const snap = await getDocs(q);
  return snap.docs.map((d) =>
    toPlainTimestamps({ id: d.id, ...(d.data() as Omit<Report, 'id'>) })
  );
};

interface ReviewReportInput {
  status: ReportStatus;
  reviewedBy: string;
  resolutionNote?: string;
}

export const reviewReport = async (
  reportId: string,
  input: ReviewReportInput
): Promise<void> => {
  await updateDoc(doc(db, COLLECTION, reportId), {
    status: input.status,
    reviewedBy: input.reviewedBy,
    reviewedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    ...(input.resolutionNote ? { resolutionNote: input.resolutionNote } : {}),
  });
};
