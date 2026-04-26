import type { LucideIcon } from 'lucide-react';
import Link from 'next/link';
import type { MouseEventHandler } from 'react';
import { cx } from '@/shared/lib/classNames';
import styles from './Button.module.scss';

interface ButtonProps {
  text: string;
  icon?: LucideIcon | null;
  href?: string;
  type?: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
}

const Button = ({ text, icon, href, type, onClick }: ButtonProps) => {
  const Icon = icon;
  const className = cx(styles.root, type && styles[`root--${type}`]);
  const content = (
    <>
      {Icon && <Icon aria-hidden="true" size="1em" />}
      <span>{text}</span>
    </>
  );

  if (href) {
    return (
      <Link className={className} href={href}>
        {content}
      </Link>
    );
  }

  return (
    <button className={className} type="button" onClick={onClick}>
      {content}
    </button>
  );
};

export default Button;
