import React from 'react';
import { CircleX, type LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  message?: string;
}

const EmptyState = ({ icon: Icon = CircleX, message }: EmptyStateProps) => {
  return (
    <div className="empty-state">
      <Icon aria-hidden="true" className="empty-state__icon" size="1em" />
      {message && <p className="empty-state__message">{message}</p>}
    </div>
  );
};

export default React.memo(EmptyState);
