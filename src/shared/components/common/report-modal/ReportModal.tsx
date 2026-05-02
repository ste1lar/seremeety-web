'use client';

import { useEffect, useState } from 'react';
import Modal from '@/shared/components/common/modal/Modal';
import styles from './ReportModal.module.scss';

const REASON_OPTIONS = [
  { value: 'inappropriate_photo', label: '부적절한 사진' },
  { value: 'harassment', label: '괴롭힘 / 협박' },
  { value: 'spam', label: '스팸 / 광고' },
  { value: 'fake_profile', label: '허위 프로필' },
  { value: 'underage', label: '미성년자로 의심' },
  { value: 'other', label: '기타' },
] as const;

interface ReportModalProps {
  open: boolean;
  isSubmitting?: boolean;
  onClose: () => void;
  onSubmit: (reason: string, description: string) => void;
}

const ReportModal = ({
  open,
  isSubmitting = false,
  onClose,
  onSubmit,
}: ReportModalProps) => {
  const [reason, setReason] = useState<string>('');
  const [description, setDescription] = useState('');

  // 모달이 닫힐 때 입력 초기화. 다음 신고 시 깨끗한 상태에서 시작.
  useEffect(() => {
    if (!open) {
      setReason('');
      setDescription('');
    }
  }, [open]);

  const canSubmit = reason !== '' && !isSubmitting;

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit(reason, description.trim());
  };

  return (
    <Modal
      open={open}
      title="신고하기"
      description="관리자가 검토 후 적절한 조치를 취해요."
      closeOnBackdrop={!isSubmitting}
      showCloseButton={!isSubmitting}
      onClose={onClose}
      actions={[
        {
          label: '취소',
          tone: 'secondary',
          onClick: onClose,
          autoClose: false,
          disabled: isSubmitting,
        },
        {
          label: isSubmitting ? '제출 중...' : '신고',
          onClick: handleSubmit,
          autoClose: false,
          disabled: !canSubmit,
        },
      ]}
    >
      <fieldset className={styles.reasons}>
        <legend className={styles.legend}>사유</legend>
        {REASON_OPTIONS.map((option) => (
          <label className={styles.option} key={option.value}>
            <input
              type="radio"
              name="report-reason"
              value={option.value}
              checked={reason === option.value}
              onChange={() => setReason(option.value)}
              disabled={isSubmitting}
            />
            <span>{option.label}</span>
          </label>
        ))}
      </fieldset>

      <label className={styles.detail}>
        <span className={styles.detailLabel}>상세 설명 (선택)</span>
        <textarea
          className={styles.textarea}
          rows={3}
          maxLength={500}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          disabled={isSubmitting}
          placeholder="추가 정보가 있다면 적어주세요"
        />
      </label>
    </Modal>
  );
};

export default ReportModal;
