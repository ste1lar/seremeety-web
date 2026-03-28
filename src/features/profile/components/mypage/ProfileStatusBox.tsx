import { Image, MailOpen, Sparkles, SquarePen, Star } from 'lucide-react';
import type { ProfileStats } from '@/shared/types/domain';

interface ProfileStatusBoxProps {
  stats: ProfileStats;
}

const ProfileStatusBox = ({ stats }: ProfileStatusBoxProps) => {
  const rows = [
    {
      icon: Image,
      label: '프로필 사진',
      value: stats.hasProfileImage ? '등록 완료' : '미등록',
    },
    {
      icon: SquarePen,
      label: '자기소개',
      value: `${stats.introLength}/500자`,
    },
    {
      icon: Sparkles,
      label: '셀소 상태',
      value: stats.hasSelso ? '등록됨' : '미등록',
    },
    {
      icon: MailOpen,
      label: '받은 요청',
      value: `${stats.requestsReceived}회`,
    },
    {
      icon: Star,
      label: '프로필 매력',
      value: stats.profileRating || 'Shine',
    },
  ];

  return (
    <section className="profile-status-box" aria-labelledby="profile-status-box-title">
      <h2 className="sr-only" id="profile-status-box-title">
        프로필 상태
      </h2>

      <dl className="profile-status-box__list">
        {rows.map((row) => {
          const RowIcon = row.icon;

          return (
            <div className="profile-status-box__row" key={row.label}>
              <dt className="profile-status-box__label">
                <RowIcon aria-hidden="true" size="1em" />
                {row.label}
              </dt>
              <dd className="profile-status-box__value">{row.value}</dd>
            </div>
          );
        })}
      </dl>

      <p className="profile-status-box__note">
        현재 준비 중인 기능으로, 일부 항목은 임의로 표시됩니다.
      </p>
    </section>
  );
};

export default ProfileStatusBox;
