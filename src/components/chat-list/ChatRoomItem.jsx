import { useNavigate } from "react-router-dom";
import { formatTimeStampForList } from "../../utils";
import "./ChatRoomItem.css";
import ImageLoading from "../common/image-loading/ImageLoading";
import { useState } from "react";

const ChatRoomItem = ({ id, nickname, profilePictureUrl, lastMessage }) => {
    const [isImgLoaded, setIsImgLoaded] = useState(false);
    const navigate = useNavigate();

    const handleChatRoomClick = () => {
        navigate(`/chat-room/${id}`);
    };

    return (
        <div className="chat-room-item" onClick={handleChatRoomClick}>
            <div className="chat-room-item__image">
                {!isImgLoaded && <ImageLoading borderRadius={"50%"} />}
                <img
                    alt="PROFILE"
                    src={profilePictureUrl}
                    onLoad={() => setIsImgLoaded(true)}
                    style={{ display: !isImgLoaded ? "none" : "block" }}
                />
            </div>
            <div className="chat-room-item__content">
                <div className="chat-room-item__info">
                    <div className="chat-room-item__nickname">{nickname}</div>
                    <div className="chat-room-item__sent-at">{formatTimeStampForList(lastMessage.sentAt)}</div>
                </div>
                <div className="chat-room-item__message">{lastMessage.text}</div>
            </div>
        </div>
    );
};

export default ChatRoomItem;