import React from 'react';
import type { LucideIcon } from 'lucide-react';
import type { MouseEventHandler } from 'react';

interface MenuItemProps {
  icon: LucideIcon;
  dataRoute: string;
  label: string;
  isSelected: boolean;
  onClick: MouseEventHandler<HTMLButtonElement>;
}

const MenuItem = ({ icon: Icon, dataRoute, label, isSelected, onClick }: MenuItemProps) => {
  return (
    <button
      className={`menu-item${isSelected ? ' menu-item--selected' : ''}`}
      data-route={dataRoute}
      type="button"
      onClick={onClick}
    >
      <Icon aria-hidden="true" size="1em" />
      <span className="menu-item__label">{label}</span>
    </button>
  );
};

export default React.memo(MenuItem);
