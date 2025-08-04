import './Profile.css';
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import Swal from "sweetalert2";
import ProfileHeader from "../../components/profile/ProfileHeader";
import ProfileContent from "../../components/profile/ProfileContent";
import PageTransition from "../../components/common/PageTransition";
import Loading from "../../components/common/loading/Loading";
import { MypageDispatchContext, MypageStateContext } from "../../contexts/MypageContext";
import { RequestDispatchContext } from "../../contexts/RequestContext";
import { getUserDataByUid } from "../../utils";

const Profile = () => {
    const [userProfile, setUserProfile] = useState({});
    const { uid } = useParams();
    const state = useContext(MypageStateContext);
    const { onUpdateCoin } = useContext(MypageDispatchContext);
    const { onCreate } = useContext(RequestDispatchContext);
    const navigate = useNavigate();
    const location = useLocation();
    const isViewOnly = location.state?.isViewOnly || false;

    useEffect(() => {
        if (state.profileStatus === undefined) {
            return;
        }
        if (state.profileStatus !== 1) {
            Swal.fire({
                title: "프로필 열람",
                text: "먼저 프로필을 완성해주세요",
                icon: "warning",
                confirmButtonText: "확인",
                customClass: {
                    confirmButton: 'no-focus-outline'
                },
                willClose: () => {
                    navigate('/my-profile', { replace: true });
                }
            });
            return;
        }

        const fetchUserProfile = async () => {
            try {
                const userData = await getUserDataByUid(uid);
                if (userData) {
                    setUserProfile(userData);   
                } else {
                    Swal.fire({
                        title: "오류",
                        text: "존재하지 않는 프로필입니다",
                        icon: "error",
                        confirmButtonText: "확인",
                        customClass: {
                            confirmButton: 'no-focus-outline'
                        },
                        willClose: () => {
                            navigate(-1, { replace: true });
                        }
                    });
                }
            } catch (error) {
                console.log(error);
            }
        };

        fetchUserProfile();
    }, [uid, state.profileStatus]);

    if (Object.keys(userProfile).length <= 0) {
        return <Loading />
    } else {
        return (
            <div className="profile">
                <PageTransition>
                    <ProfileHeader />
                    <ProfileContent
                        userProfile={userProfile}
                        uid={uid}
                        isViewOnly={isViewOnly}
                        onCreateRequest={onCreate}
                        myProfile={state}
                        onUpdateCoin={onUpdateCoin}
                    />
                </PageTransition>
            </div>
        )
    }
};

export default Profile;