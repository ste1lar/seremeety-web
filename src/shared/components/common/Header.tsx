'use client';

import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import seremeetyLogo from '@/shared/assets/images/seremeety-logo.png';

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
    if (onLogoClick) {
      onLogoClick();
      return;
    }

    router.push(logoHref);
  };

  const handleBackClick = () => {
    if (onBackClick) {
      onBackClick();
      return;
    }

    router.back();
  };

  const MenuWrapper = menuAriaLabel ? 'nav' : 'div';

  return (
    <header className={['header', variant && `header--${variant}`].filter(Boolean).join(' ')}>
      <button className="header__logo" type="button" onClick={handleLogoClick}>
        <img alt="Seremeety 로고" src={seremeetyLogo.src} />
        Seremeety
      </button>
      {showBackButton && (
        <button className="header__back-button" type="button" onClick={handleBackClick} aria-label="뒤로 가기">
          <ChevronLeft aria-hidden="true" size="1em" />
        </button>
      )}
      <div className="header__content">
        <TitleTag className="header__title" id={titleId}>
          {title}
        </TitleTag>
        {menu && (
          <MenuWrapper className="header__menu" aria-label={menuAriaLabel}>
            {menu}
          </MenuWrapper>
        )}
      </div>
    </header>
  );
}
