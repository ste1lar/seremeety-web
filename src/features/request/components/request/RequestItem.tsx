import { Check, CircleHelp, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { formatTimeStampForList } from '@/shared/lib/format';
import { useState } from 'react';
import ImageLoading from '@/shared/components/common/image-loading/ImageLoading';
import Modal, { type ModalConfig } from '@/shared/components/common/modal/Modal';
import type { EnhancedMatchRequest, MatchRequest, RequestStatus } from '@/shared/types/domain';
import styles from './RequestItem.module.scss';

interface RequestItemProps {
  request: EnhancedMatchRequest;
  onUpdateRequest: (requestId: string, updatedRequest: MatchRequest) => Promise<void>;
  onCreateChatRoom: (currentUserUid: string, otherUserUid: string) => Promise<void>;
}

const requestUpdateContentByStatus = {
  accepted: {
    description: '매칭을 수락하셔서 채팅방이 생성되었어요!',
    title: '매칭 수락',
  },
  rejected: {
    description: '매칭을 거절하셨어요',
    title: '요청 거절',
  },
} as const;

const RequestItem = ({ request, onUpdateRequest, onCreateChatRoom }: RequestItemProps) => {
  const [requestStatus, setRequestStatus] = useState(request.status);
  const [isImgLoaded, setIsImgLoaded] = useState(false);
  const [modal, setModal] = useState<ModalConfig | null>(null);
  const otherUserUid = request.isReceived ? request.from : request.to;
  const profileHref = `/profile/${otherUserUid}?viewOnly=1`;

  const handleRequestUpdate = async (newStatus: Exclude<RequestStatus, 'pending'>) => {
    setRequestStatus(newStatus);
    await onUpdateRequest(request.id, {
      id: request.id,
      createdAt: request.createdAt,
      from: request.from,
      status: newStatus,
      to: request.to,
    });

    if (newStatus === 'accepted') {
      await onCreateChatRoom(request.to, request.from);
    }

    const feedback = requestUpdateContentByStatus[newStatus];
    setModal({
      actions: [{ label: '확인' }],
      closeOnBackdrop: false,
      description: feedback.description,
      showCloseButton: false,
      title: feedback.title,
    });
  };

  const handleRequestStatusClick = async () => {
    if (!request.isReceived || requestStatus !== 'pending') {
      setModal({
        actions: [{ label: '확인' }],
        closeOnBackdrop: false,
        description: {
          pending: '매칭 대기 중이에요',
          accepted: '수락된 매칭이에요',
          rejected: '성사되지 않은 매칭이에요',
        }[requestStatus],
        showCloseButton: false,
        title: '매칭',
      });
    } else {
      setModal({
        actions: [
          { label: '거절', onClick: () => void handleRequestUpdate('rejected'), tone: 'secondary' },
          { label: '수락', onClick: () => void handleRequestUpdate('accepted') },
        ],
        closeOnBackdrop: true,
        description: '요청을 수락할까요?',
        showCloseButton: true,
        title: '매칭 요청',
      });
    }
  };

  const statusText = { pending: '매칭 대기', accepted: '매칭 수락', rejected: '매칭 실패' }[
    requestStatus
  ];
  const StatusIcon = {
    pending: { icon: CircleHelp, color: 'gray' },
    accepted: { icon: Check, color: '#a5dc86' },
    rejected: { icon: X, color: '#f27474' },
  }[requestStatus];
  const StatusIconComponent = StatusIcon.icon;

  return (
    <article className={styles.root}>
      <Link className={styles.avatar} href={profileHref}>
        {!isImgLoaded && <ImageLoading borderRadius={'50%'} />}
        <Image
          alt={`${request.nickname} 프로필 사진`}
          src={request.profilePictureUrl}
          fill
          sizes="64px"
          onLoad={() => setIsImgLoaded(true)}
          style={{ display: !isImgLoaded ? 'none' : 'block' }}
        />
      </Link>
      <button
        className={styles.action}
        type="button"
        onClick={() => void handleRequestStatusClick()}
        aria-label={
          request.isReceived && requestStatus === 'pending'
            ? `${request.nickname}님의 요청에 응답하기`
            : `${request.nickname}님의 매칭 상태 보기`
        }
      >
        <span className={styles.info}>
          <span className={styles.nickname}>{request.nickname}</span>
          <time className={styles.timestamp}>{formatTimeStampForList(request.createdAt)}</time>
        </span>
        <span className={styles.status}>
          <span className={styles['status-icon']}>
            <StatusIconComponent aria-hidden="true" size={20} style={{ color: StatusIcon.color }} />
          </span>
          <span className={styles['status-text']}>
            <span>{statusText}</span>
            {requestStatus === 'pending' && <span className={styles.progress} />}
          </span>
        </span>
      </button>
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
    </article>
  );
};

export default RequestItem;
