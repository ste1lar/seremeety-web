'use client';

import { ChevronLeft } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import seremeetyLogo from '@/shared/assets/images/seremeety-logo.png';
import { cx } from '@/shared/lib/classNames';
import styles from './Header.module.scss';

type HeadingTag = 'h1' | 'h2';

interface HeaderProps {
  headingLevel?: HeadingTag;
  logoHref?: string;
  menu?: ReactNode;
  menuAriaLabel?: string;
  onBackClick?: () => void;
  onLogoClick?: () => void;
  showBackButton?: boolean;
  title: string;
  titleId?: string;
  variant?: string;
}

export default function Header({
  headingLevel = 'h2',
  logoHref = '/mypage',
  menu,
  menuAriaLabel,
  onBackClick,
  onLogoClick,
  showBackButton = false,
  title,
  titleId,
  variant,
}: HeaderProps) {
  const router = useRouter();
  const TitleTag = headingLevel;

  const handleLogoClick = () => {
    onLogoClick?.();
  };

  const handleBackClick = () => {
    if (onBackClick) {
      onBackClick();
      return;
    }

    router.back();
  };

  const MenuWrapper = menuAriaLabel ? 'nav' : 'div';
  const logoContent = (
    <>
      <Image alt="Seremeety 로고" src={seremeetyLogo} width={48} height={48} />
      Seremeety
    </>
  );

  return (
    <header className={cx(styles.root, variant && styles[`root--${variant}`])}>
      {onLogoClick ? (
        <button className={styles.logo} type="button" onClick={handleLogoClick}>
          {logoContent}
        </button>
      ) : (
        <Link className={styles.logo} href={logoHref}>
          {logoContent}
        </Link>
      )}
      {showBackButton && (
        <button
          className={styles.back}
          type="button"
          onClick={handleBackClick}
          aria-label="뒤로 가기"
        >
          <ChevronLeft aria-hidden="true" size="1em" />
        </button>
      )}
      <div className={styles.content}>
        <TitleTag className={styles.title} id={titleId}>
          {title}
        </TitleTag>
        {menu && (
          <MenuWrapper className={styles.menu} aria-label={menuAriaLabel}>
            {menu}
          </MenuWrapper>
        )}
      </div>
    </header>
  );
}
