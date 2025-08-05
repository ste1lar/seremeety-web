import Swal from "sweetalert2";
import { auth } from "../../firebase";
import { icons, isRequestExist } from "../../utils";
import Button from '../common/button/Button';
import "./ProfileContent.css";
import React, { useState } from "react";
import ImageLoading from '../common/image-loading/ImageLoading';
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const ProfileContent = ({ userProfile, uid, isViewOnly, onCreateRequest, myProfile, onUpdateCoin }) => {
    const [isImgLoaded, setIsImgLoaded] = useState(false);
    const navigate = useNavigate();

    const handleRequestClick = async () => {
        const currentUserUid = auth.currentUser.uid;
        const result = await Swal.fire({
            title: "매칭 요청",
            text: "요청을 보내시겠어요? · 10음표",
            showCancelButton: true,
            confirmButtonText: "확인",
            cancelButtonText: "취소",
            showCloseButton: true,
            reverseButtons: true,
            customClass: {
                confirmButton: 'no-focus-outline',
                cancelButton: 'no-focus-outline'
            },
        });

        if (result.isConfirmed) {
            try {
                if (!await isRequestExist(currentUserUid, uid)) {
                    if (myProfile.coin < 10) {
                        const result = await Swal.fire({
                            title: "음표 부족",
                            text: "음표가 부족해요 상점으로 이동할까요?",
                            showCancelButton: true,
                            confirmButtonText: "확인",
                            cancelButtonText: "취소",
                            showCloseButton: true,
                            reverseButtons: true,
                            customClass: {
                                confirmButton: 'no-focus-outline',
                                cancelButton: 'no-focus-outline'
                            },
                        });

                        if (result.isConfirmed) {
                            navigate("/shop");
                        }
                        return;
                    }

                    onCreateRequest(currentUserUid, uid);
                    onUpdateCoin({ ...myProfile, coin: myProfile.coin - 10 });
                    Swal.fire({
                        title: "매칭 요청",
                        text: "성공적으로 전송되었어요!",
                        confirmButtonText: "확인",
                        customClass: {
                            confirmButton: 'no-focus-outline'
                        }
                    });
                } else {
                    Swal.fire({
                        title: "매칭 요청",
                        text: "이미 보내셨거나 받으신 요청이 있어요",
                        confirmButtonText: "확인",
                        customClass: {
                            confirmButton: 'no-focus-outline'
                        },
                    });
                }
            } catch (error) {
                console.log(error);
            }
        }
    };

    return (
        <div className="profile-content">
            <div className="profile-content__img-section">
                {!isImgLoaded && <ImageLoading borderRadius="0.3125rem" />}
                <img
                    alt="PROFILE"
                    src={userProfile.profilePictureUrl}
                    onLoad={() => setIsImgLoaded(true)}
                    className={`profile-content__img ${!isImgLoaded ? 'hidden' : ''}`}
                />
            </div>

            <div className="profile-content__info-upper">
                <div className="profile-content__nickname">{userProfile.nickname}</div>
                <div className="profile-content__age-gender">
                    {userProfile.age}
                    <FontAwesomeIcon
                        icon={userProfile.gender === "male" ? icons.faMars : icons.faVenus}
                        className={`profile-content__gender-icon ${userProfile.gender}`}
                    />
                </div>
            </div>

            <div className="profile-content__info-lower">
                <div className="profile-content__info">
                    <FontAwesomeIcon icon={icons.faHeartRegular} />
                    {userProfile.mbti}
                </div>
                <div className="profile-content__info">
                    <FontAwesomeIcon icon={icons.faGraduationCap} />
                    {userProfile.university}
                </div>
                <div className="profile-content__info">
                    <FontAwesomeIcon icon={icons.faLocationArrow} />
                    {userProfile.place}
                </div>
            </div>

            <div className="profile-content__intro">
                <div className="profile-content__intro-label">
                    <FontAwesomeIcon icon={icons.faUserRegular} />
                    자기소개
                </div>
                <div className="profile-content__intro-text">
                    {userProfile.introduce.split('\n').map((line, idx) => (
                        <React.Fragment key={idx}>
                            {line}
                            <br />
                        </React.Fragment>
                    ))}
                </div>
            </div>

            {!isViewOnly && 
                <div className="profile-content__button-wrapper">
                    <Button text="매칭 요청" onClick={handleRequestClick} />
                </div>
            }
        </div>
    );
};

export default ProfileContent;