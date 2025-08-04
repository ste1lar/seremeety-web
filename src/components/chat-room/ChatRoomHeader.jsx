import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./ChatRoomHeader.css";
import { icons } from "../../utils";
import { useNavigate } from "react-router-dom";

const ChatRoomHeader = ({ nickname }) => {
    const navigate = useNavigate();

    return (
        <div className="chat-room-header">
            <FontAwesomeIcon
                icon={icons.faAngleLeft}
                className="chat-room-header__icon"
                onClick={() => navigate(-1)}
            />
            <div className="chat-room-header__nickname">{nickname}</div>
            <div className="chat-room-header__menu">
                <FontAwesomeIcon icon={icons.faBars} className="chat-room-header__icon" />
                <FontAwesomeIcon icon={icons.faMagnifyingGlass} className="chat-room-header__icon" />
            </div>
        </div>
    );
};

export default React.memo(ChatRoomHeader);