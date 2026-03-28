import type { LucideIcon } from 'lucide-react';
import type { MouseEventHandler } from 'react';

interface ButtonProps {
  text: string;
  icon?: LucideIcon | null;
  type?: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
}

const Button = ({ text, icon, type, onClick }: ButtonProps) => {
  const Icon = icon;

  return (
    <button
      className={['button', type && `button--${type}`].filter(Boolean).join(' ')}
      type="button"
      onClick={onClick}
    >
      {Icon && <Icon aria-hidden="true" size="1em" />}
      <span>{text}</span>
    </button>
  );
};

export default Button;
