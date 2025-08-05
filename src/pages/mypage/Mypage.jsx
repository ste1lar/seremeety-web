import './Mypage.css';
import { useContext, useEffect } from "react";
import { MypageStateContext } from '../../contexts/MypageContext';
import Loading from '../../components/common/loading/Loading';
import MypageHeader from '../../components/mypage/MypageHeader';
import MypageContent from '../../components/mypage/MypageContent';

const Mypage = () => {
    const state = useContext(MypageStateContext);
    console.log(state);

    // 컴포넌트 마운트 시, 스크롤 맨 위로 이동
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "auto" });
    }, []);

    if (Object.keys(state).length <= 0) {
        return <Loading />;
    } else {
        return (
            <div className="mypage">
                <MypageHeader userProfile={state} />
                <MypageContent userProfile={state} />
            </div>
        );
    }
};

export default Mypage;