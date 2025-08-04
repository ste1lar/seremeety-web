import './MainLayout.css';
import { Outlet } from 'react-router-dom';
import BottomMenu from '../bottom-menu/BottomMenu';


const MainLayout = () => {
    return (
        // 메인 컨텐츠(각 라우팅 단위 페이지로 헤더와 컨텐츠 포함), 하단 메뉴의 2단 구조
        <div className="main-layout">
            <main className="main-layout__content">
                <Outlet />
            </main>
            <BottomMenu />
        </div>
    );
};

export default MainLayout;