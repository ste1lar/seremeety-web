import './ChatList.css';
import { useContext } from "react";
import ChatListHeader from "../../components/chat-list/ChatListHeader";
import ChatListContent from "../../components/chat-list/ChatListContent";
import { ChatStateContext } from "../../contexts/ChatContext";

const ChatList = () => {
    const state = useContext(ChatStateContext);

    return (
        <div className="chat-list">
            <ChatListHeader />
            <ChatListContent chatRooms={state} />
        </div>
    );
};

export default ChatList;