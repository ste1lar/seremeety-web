import { Navigate, Route, Routes } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { auth } from './firebase';
import {
    getUserDataByUid,
    setNewUserData,
} from './utils';

// 페이지
import Matching from './pages/matching/Matching';
import Request from './pages/request/Request';
import Mypage from './pages/mypage/Mypage';
import Shop from './pages/shop/Shop';
import ChatList from './pages/chat-list/ChatList';
import ChatRoom from './pages/chat-room/ChatRoom';
import Login from './pages/login/Login';
import Profile from './pages/profile/Profile';
import MyProfile from './pages/my-profile/MyProfile';
import Setting from './pages/setting/Setting';
import Loading from './components/common/loading/Loading';

// 컨텍스트
import { MypageProvider } from './contexts/MypageContext';
import { MatchingProvider } from './contexts/MatchingContext';
import { RequestProvider } from './contexts/RequestContext';
import { ChatProvider } from './contexts/ChatContext';

// 레이아웃
import MainLayout from './layouts/main-layout/MainLayout';
import MinimalLayout from './layouts/minimal-layout/MinimalLayout';

function App() {
    const [currentUser, setCurrentUser] = useState(null);
    const [isNewUserRegd, setIsNewUserRegd] = useState(false); // Firebase Auth에 유저가 있어도 Firestore에 데이터가 아직 없는 상황 방지
    const [isDataLoaded, setIsDataLoaded] = useState(false);

    // 우클릭 방지
    useEffect(() => {
        const handleContextMenu = (e) => e.preventDefault();
        document.addEventListener("contextmenu", handleContextMenu);
        return () => document.removeEventListener("contextmenu", handleContextMenu);
    }, []);

    // 마운트 시점에 한 번 콜백 실행
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user) {
                setCurrentUser(user); // 현재 로그인 유저 저장
                try {
                    const userData = await getUserDataByUid(user.uid); // Firestore에 유저 데이터 있는지 확인
                    if (!userData) {
                        await setNewUserData(user); // 없으면 새 유저 등록
                        console.log("new user regd");
                    }
                } catch (error) {
                    console.error(error);
                } finally {
                    setIsNewUserRegd(true); // 신규 유저든 아니든, 등록 완료됨을 표시
                }
            } else {
                setCurrentUser(null); // 로그아웃 상태
                setIsNewUserRegd(false);
            }
            setIsDataLoaded(true);
        });

        // 언마운트 시 clean-up(구독 해제)
        return () => unsubscribe();
    }, []);

    if (!isDataLoaded || (currentUser && !isNewUserRegd)) {
        return <Loading />;
    }

    // 로그인 상태 아님
    if (!currentUser) {
        return (
            <Routes>
                <Route element={<MinimalLayout />}>
                    <Route index element={<Login />} />
                    <Route path="*" element={<Navigate to="/" />} />
                </Route>
            </Routes>
        );
    }

    // 로그인 상태 & 유저 등록됨
    const mainRoutes = (
        <Routes>
            {/* MainLayout */}
            <Route element={<MainLayout />}>
                <Route path="/matching" element={<Matching />} />
                <Route
                    path="/request"
                    element={
                        <RequestProvider>
                            <ChatProvider enableSubscription={false}>
                                <Request />
                            </ChatProvider>
                        </RequestProvider>
                    }
                />
                <Route
                    path="/chat-list"
                    element={
                        <ChatProvider>
                            <ChatList />
                        </ChatProvider>
                    }
                />
                <Route path="/mypage" element={<Mypage />} />
            </Route>
            
            {/* MinimalLayout */}
            <Route element={<MinimalLayout />}>
                <Route path="/my-profile" element={<MyProfile />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/setting" element={<Setting />} />
                <Route
                    path="/profile/:uid"
                    element={
                        <RequestProvider>
                            <Profile />
                        </RequestProvider>
                    }
                />
                <Route
                    path="/chat-room/:chatRoomId"
                    element={
                        <ChatProvider enableSubscription={false}>
                            <ChatRoom />
                        </ChatProvider>
                    }
                />
            </Route>
            
            {/* / 진입 시 matching으로 리디렉션 */}
            <Route index element={<Navigate to="/matching" />} />

            {/* 잘못된 경로는 매칭으로 리디렉션 */}
            <Route path="*" element={<Navigate to="/matching" />} />
        </Routes>
    );

    return (
        // MatchingProvider와 MypageProvider는 전체 앱에 필요
        <MatchingProvider>
            <MypageProvider>
                {mainRoutes}
            </MypageProvider>
        </MatchingProvider>
    );
}

export default App;