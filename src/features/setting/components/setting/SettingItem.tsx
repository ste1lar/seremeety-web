import { ChevronRight } from 'lucide-react';
import type { MouseEventHandler } from 'react';

interface SettingItemProps {
  content: string;
  onClick: MouseEventHandler<HTMLButtonElement>;
}

const SettingItem = ({ content, onClick }: SettingItemProps) => {
  return (
    <button className="setting-item" type="button" onClick={onClick}>
      {content}
      <ChevronRight aria-hidden="true" size="1em" />
    </button>
  );
};

export default SettingItem;
