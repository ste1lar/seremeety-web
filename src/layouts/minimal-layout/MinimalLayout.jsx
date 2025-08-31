import './MinimalLayout.css';
import { Outlet } from 'react-router-dom';

const MinimalLayout = () => {
  return (
    // 하단 메뉴 없이 컨텐츠(각 라우팅 단위 페이지)로만 구성
    <div className="minimal-layout">
      <main className="minimal-layout__content">
        <Outlet />
      </main>
    </div>
  );
};

export default MinimalLayout;
