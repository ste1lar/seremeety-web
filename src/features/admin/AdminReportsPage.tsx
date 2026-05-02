'use client';

import { useState } from 'react';
import { ClipboardCheck } from 'lucide-react';
import {
  useDismissReportMutation,
  useGetOpenReportsQuery,
  useResolveReportMutation,
  useSetUserStatusMutation,
} from '@/shared/lib/api/adminApi';
import EmptyState from '@/shared/components/common/empty-state/EmptyState';
import Loading from '@/shared/components/common/loading/Loading';
import type { Report } from '@/shared/types/model/safety';
import styles from './AdminQueuePage.module.scss';

const REASON_LABEL: Record<string, string> = {
  inappropriate_photo: '부적절한 사진',
  harassment: '괴롭힘 / 협박',
  spam: '스팸 / 광고',
  fake_profile: '허위 프로필',
  underage: '미성년자',
  other: '기타',
};

const AdminReportsPage = () => {
  const { data: reports = [], isLoading } = useGetOpenReportsQuery();
  const [resolveReport, { isLoading: isResolving }] = useResolveReportMutation();
  const [dismissReport, { isLoading: isDismissing }] = useDismissReportMutation();
  const [setUserStatus, { isLoading: isSuspending }] = useSetUserStatusMutation();
  const isBusy = isResolving || isDismissing || isSuspending;

  if (isLoading) {
    return <Loading />;
  }

  if (reports.length === 0) {
    return (
      <EmptyState icon={ClipboardCheck} message="처리 대기 중인 신고가 없어요" />
    );
  }

  return (
    <section className={styles.root} aria-labelledby="admin-reports-title">
      <h2 id="admin-reports-title" className={styles.heading}>
        신고 ({reports.length})
      </h2>
      <ul className={styles.list}>
        {reports.map((report) => (
          <ReportReviewItem
            key={report.id}
            report={report}
            disabled={isBusy}
            onResolve={(note) =>
              void resolveReport({ reportId: report.id, resolutionNote: note })
            }
            onDismiss={(note) =>
              void dismissReport({ reportId: report.id, resolutionNote: note })
            }
            onSuspendTarget={() => {
              if (!report.targetUserId) return;
              void setUserStatus({
                uid: report.targetUserId,
                status: 'suspended',
              });
              void resolveReport({
                reportId: report.id,
                resolutionNote: 'escalated_to_suspend',
              });
            }}
          />
        ))}
      </ul>
    </section>
  );
};

interface ReportReviewItemProps {
  report: Report;
  disabled: boolean;
  onResolve: (note: string) => void;
  onDismiss: (note: string) => void;
  onSuspendTarget: () => void;
}

const ReportReviewItem = ({
  report,
  disabled,
  onResolve,
  onDismiss,
  onSuspendTarget,
}: ReportReviewItemProps) => {
  const [note, setNote] = useState('');

  return (
    <li className={styles.item}>
      <header className={styles.itemHeader}>
        <strong className={styles.nickname}>
          {REASON_LABEL[report.reason] ?? report.reason}
        </strong>
        <span className={styles.meta}>
          {report.targetType} · {report.targetId.slice(0, 8)}
        </span>
      </header>
      <dl className={styles.fields}>
        <dt>신고자</dt>
        <dd>{report.reporterUserId.slice(0, 8)}</dd>
        {report.targetUserId && (
          <>
            <dt>대상 사용자</dt>
            <dd>{report.targetUserId.slice(0, 8)}</dd>
          </>
        )}
      </dl>
      {report.description && <p className={styles.bio}>{report.description}</p>}
      <div className={styles.actions}>
        <input
          type="text"
          placeholder="처리 메모 (선택)"
          className={styles.reason}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          disabled={disabled}
        />
        <button
          type="button"
          className={styles.reject}
          onClick={() => onDismiss(note)}
          disabled={disabled}
        >
          기각
        </button>
        <button
          type="button"
          className={styles.approve}
          onClick={() => onResolve(note)}
          disabled={disabled}
        >
          처리 완료
        </button>
        {report.targetUserId && (
          <button
            type="button"
            className={styles.reject}
            onClick={onSuspendTarget}
            disabled={disabled}
            title="대상 사용자를 정지하고 신고 처리"
          >
            대상 정지
          </button>
        )}
      </div>
    </li>
  );
};

export default AdminReportsPage;
