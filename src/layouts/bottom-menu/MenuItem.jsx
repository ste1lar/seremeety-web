import React from 'react';
import './MenuItem.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const MenuItem = ({ icon, selectedIcon, dataRoute, label, isSelected, onClick }) => {
  return (
    <div
      className={`menu-item${isSelected ? ' menu-item--selected' : ''}`}
      data-route={dataRoute}
      onClick={onClick}
    >
      <FontAwesomeIcon icon={isSelected ? selectedIcon : icon} />
      <div className="menu-item__label">{label}</div>
    </div>
  );
};

export default React.memo(MenuItem);
