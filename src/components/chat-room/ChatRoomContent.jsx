import { useEffect, useRef, useState } from "react";
import { auth } from "../../firebase";
import ChatMessage from "./ChatMessage";
import "./ChatRoomContent.css";
import { useInView } from "react-intersection-observer";
import { formatDateLabel, isSameDate } from "../../utils";

const ChatRoomContent = ({ chatRoomMessages, nickname, profilePictureUrl }) => {
    const [isFirstLoad, setIsFirstLoad] = useState(true);
    const [visibleCount, setVisibleCount] = useState(20);
    const [prevHeight, setPrevHeight] = useState(0);

    const visibleCountRef = useRef(visibleCount);
    const [ref, inView] = useInView();

    // 최초 진입 또는 메시지 업데이트 시 전체 스크롤을 맨 아래로 이동
    // TODO: 자신이 보낸 것에만 적용, 상대가 보낼 시 새 메시지 알림 등으로 수정
    useEffect(() => {
        if (chatRoomMessages.length > 0) {
            console.log("scroll bottom (window)");
            setTimeout(() => {
                window.scrollTo({
                    top: document.documentElement.scrollHeight,
                    behavior: "auto"
                });
                setIsFirstLoad(false);
            }, 100); // DOM 렌더링 이후 스크롤 조정
        }
    }, [chatRoomMessages, isFirstLoad]);

    // 스크롤 상단 도달 시 메시지 20개 더 로딩
    useEffect(() => {
        if (!isFirstLoad && inView && visibleCountRef.current < chatRoomMessages.length) {
            // 현재 스크롤 높이 저장
            setPrevHeight(document.documentElement.scrollHeight);
            setVisibleCount((prevCount) => Math.min(prevCount + 20, chatRoomMessages.length));
            console.log("20 more msgs");
        }
    }, [inView]);

    // 메시지 추가 후 스크롤 위치 복구
    useEffect(() => {
        if (prevHeight > 0) {
            requestAnimationFrame(() => {
                const newHeight = document.documentElement.scrollHeight;
                const scrollOffset = newHeight - prevHeight;
                window.scrollBy(0, scrollOffset); // 이전 위치만큼 아래로 이동
            });
        }
    }, [prevHeight]);

    // visibleCountRef 업데이트
    useEffect(() => {
        visibleCountRef.current = visibleCount;
    }, [visibleCount]);

    return (
        <div className="chat-room-content">
            <div ref={ref} />
            {chatRoomMessages &&
                chatRoomMessages
                    .slice(-visibleCount)
                    .reduce((acc, message, index, arr) => {
                        const prev = arr[index - 1];
                        const isNewDate = !prev || !isSameDate(prev.sentAt, message.sentAt);

                        if (isNewDate) {
                            acc.push(
                                <div key={`date-${message.id}`} className="chat-room-content__date-label">
                                    {formatDateLabel(message.sentAt)}
                                </div>
                            );
                        }

                        acc.push(
                            <ChatMessage
                                key={message.id}
                                {...message}
                                isMyMsg={message.sender === auth.currentUser.uid}
                                nickname={nickname}
                                profilePictureUrl={profilePictureUrl}
                            />
                        );
                        return acc;
                    }, [])
            }
        </div>
    );
};

export default ChatRoomContent;