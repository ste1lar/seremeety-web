import { useNavigate } from "react-router-dom";
import { formatTimeStampForList, icons } from "../../utils";
import "./RequestItem.css";
import Swal from "sweetalert2";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ImageLoading from "../common/image-loading/ImageLoading";

const RequestItem = ({ request, onUpdateRequest, onCreateChatRoom }) => {
    const [requestStatus, setRequestStatus] = useState(request.status);
    const [isImgLoaded, setIsImgLoaded] = useState(false);
    const navigate = useNavigate();
    
    const handleProfilePictureClick = (e) => {
        e.stopPropagation(); // 이벤트 전파 방지(부모 이벤트 호출 방지)
        const otherUserUid = request.isReceived ? request.from : request.to;
        navigate(`/profile/${otherUserUid}`, { state: { isViewOnly: true }});
    };

    const handleRequestUpdate = async (newStatus) => {
        setRequestStatus(newStatus);
        await onUpdateRequest(request.id, {
            createdAt: request.createdAt,
            from: request.from,
            status: newStatus,
            to: request.to
        });

        if (newStatus === "accepted") {
            await onCreateChatRoom(request.to, request.from);
        }

        await Swal.fire({
            title: { accepted: "매칭 수락", rejected: "요청 거절" }[newStatus],
            text: { accepted: "매칭을 수락하셔서 채팅방이 생성되었어요!", rejected: "매칭을 거절하셨어요" }[newStatus],
            confirmButtonText: "확인",
            customClass: {
                confirmButton: 'no-focus-outline',
            },
        });
    };

    const handleRequestStatusClick = async () => {
        if (!request.isReceived || requestStatus !== "pending") {
            await Swal.fire({
                title: "매칭",
                text: {
                    pending: "매칭 대기 중이에요",
                    accepted: "수락된 매칭이에요",
                    rejected: "성사되지 않은 매칭이에요"
                }[requestStatus],
                confirmButtonText: "확인",
                customClass: {
                    confirmButton: 'no-focus-outline',
                },
            });
        } else {
            const result = await Swal.fire({
                title: "매칭 요청",
                text: "요청을 수락할까요?",
                showCancelButton: true,
                confirmButtonText: "수락",
                cancelButtonText: "거절",
                showCloseButton: true,
                reverseButtons: true,
                customClass: {
                    confirmButton: 'no-focus-outline',
                    cancelButton: 'no-focus-outline'
                },
            });
        
            if (result.isConfirmed) {
                await handleRequestUpdate("accepted");
            } else if (result.dismiss === Swal.DismissReason.cancel) {
                await handleRequestUpdate("rejected");
            }
        }
    };

    const statusText = { pending: "매칭 대기", accepted: "매칭 수락", rejected: "매칭 실패" }[requestStatus];
    const StatusIcon = {
        pending: { icon: icons.faQuestion, color: "gray" },
        accepted: { icon: icons.faCheck, color: "#a5dc86" },
        rejected: { icon: icons.faXmark, color: "#f27474" }
    }[requestStatus];

    return (
        <div className="request-item" onClick={handleRequestStatusClick}>
            <div className="request-item__image" onClick={handleProfilePictureClick}>
                {!isImgLoaded && <ImageLoading borderRadius={"50%"} />}
                <img
                    alt="PROFILE"
                    src={request.profilePictureUrl}
                    onLoad={() => setIsImgLoaded(true)}
                    style={{ display: !isImgLoaded ? "none" : "block" }}
                />
            </div>
            <div className="request-item__content">
                <div className="request-item__info">
                    <div className="request-item__nickname">{request.nickname}</div>
                    <div className="request-item__created-at">{formatTimeStampForList(request.createdAt)}</div>
                </div>
                <div className="request-item__status">
                    <div className="request-item__status-icon">
                        <FontAwesomeIcon icon={StatusIcon.icon} size="2x" style={{ color: StatusIcon.color }} />
                    </div>
                    <div className="request-item__status-text">
                        {statusText}
                        {requestStatus === "pending" && (
                            <div className="request-item__progressbar" />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RequestItem;