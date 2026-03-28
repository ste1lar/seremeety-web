import type { HTMLAttributes } from 'react';

type LoadingProps = HTMLAttributes<HTMLDivElement>;

const Loading = ({ className, ...rest }: LoadingProps) => {
  return (
    <div
      {...rest}
      className={['loading', className].filter(Boolean).join(' ')}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="loading__dots" aria-hidden="true">
        <span className="loading__dot" />
        <span className="loading__dot" />
        <span className="loading__dot" />
      </div>
      <span className="sr-only">로딩 중</span>
    </div>
  );
};

export default Loading;
