import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './EmptyState.css';
import { icons } from '../../../utils';

const EmptyState = ({ icon = icons.faCircleXmark, message }) => {
  return (
    <div className="empty-state">
      <FontAwesomeIcon icon={icon} className="empty-state__icon" />
      {message && <p className="empty-state__message">{message}</p>}
    </div>
  );
};

export default React.memo(EmptyState);
