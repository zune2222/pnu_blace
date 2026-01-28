"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChatMessage } from "@/entities/study/model/use-study-chat";
import { useAuth } from "@/entities/auth";
import { Emoji } from "@/shared/ui";

interface StudyChatProps {
  messages: ChatMessage[];
  isConnected: boolean;
  userCount: number;
  sendMessage: (content: string) => Promise<boolean>;
  loadMore: () => Promise<void>;
  hasMore: boolean;
  isLoading: boolean;
}

const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatDateDivider = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });
};

const shouldShowDateDivider = (
  current: ChatMessage,
  previous: ChatMessage | undefined
): boolean => {
  if (!previous) return true;
  const currentDate = new Date(current.createdAt).toDateString();
  const previousDate = new Date(previous.createdAt).toDateString();
  return currentDate !== previousDate;
};

export const StudyChat: React.FC<StudyChatProps> = ({
  messages,
  isConnected,
  userCount,
  sendMessage,
  loadMore,
  hasMore,
  isLoading,
}) => {
  const { user, isAuthenticated } = useAuth();

  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);

  // 새 메시지 시 자동 스크롤
  const isFirstLoad = useRef(true);

  useEffect(() => {
    if (isAtBottom && messagesEndRef.current) {
      // 첫 로드나 탭 전환 시에는 즉시 이동 (애니메이션 없음)
      const behavior = isFirstLoad.current ? "auto" : "smooth";
      messagesEndRef.current.scrollIntoView({ behavior });
      isFirstLoad.current = false;
    }
  }, [messages, isAtBottom]);

  // Intersection Observer로 인피니티 스크롤
  useEffect(() => {
    if (!loadMoreRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasMore && !isLoading) {
          loadMore();
        }
      },
      { threshold: 0.1, root: messagesContainerRef.current }
    );

    observer.observe(loadMoreRef.current);

    return () => observer.disconnect();
  }, [hasMore, isLoading, loadMore]);

  // 스크롤 위치 감지 (맨 아래인지만 확인)
  const handleScroll = () => {
    if (!messagesContainerRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    
    // 맨 아래인지 확인
    setIsAtBottom(scrollHeight - scrollTop - clientHeight < 50);
  };

  // 메시지 전송
  const handleSend = async () => {
    if (!inputValue.trim() || isSending) return;

    setIsSending(true);
    const success = await sendMessage(inputValue.trim());
    if (success) {
      setInputValue("");
    }
    setIsSending(false);
    
    // 전송 후 입력창에 포커스 유지 (리렌더링 후)
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  // Enter 키로 전송
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      if (e.nativeEvent.isComposing) return;
      e.preventDefault();
      handleSend();
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-full bg-muted-foreground/5 rounded-lg p-6">
        <p className="text-muted-foreground/60 font-light">
          로그인하면 채팅에 참여할 수 있습니다.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background border border-border/20 rounded-lg overflow-hidden">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/20 bg-muted-foreground/5 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-light text-foreground"><Emoji>💬</Emoji> 채팅</span>
          <span
            className={`w-2 h-2 rounded-full ${
              isConnected ? "bg-green-500" : "bg-red-500"
            }`}
          />
        </div>
        <span className="text-xs text-muted-foreground/60 font-light">
          {userCount}명 접속 중
        </span>
      </div>

      {/* 메시지 영역 */}
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-3"
      >
        {/* 인피니티 스크롤 sentinel */}
        {hasMore && (
          <div ref={loadMoreRef} className="h-1" />
        )}
        
        {isLoading && (
          <div className="text-center py-2">
            <span className="text-xs text-muted-foreground/50">불러오는 중...</span>
          </div>
        )}

        {messages.length === 0 && !isLoading && (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground/50 font-light text-sm">
              아직 메시지가 없습니다. 첫 번째로 인사해보세요! <Emoji>👋</Emoji>
            </p>
          </div>
        )}

        {messages.map((msg, index) => {
          const showDateDivider = shouldShowDateDivider(msg, messages[index - 1]);
          const isMyMessage = msg.studentId === user?.studentId;

          return (
            <React.Fragment key={msg.messageId}>
              {showDateDivider && (
                <div className="flex items-center gap-3 py-3 my-2">
                  <div className="flex-1 border-t border-border/30" />
                  <span className="text-xs text-muted-foreground/70 font-light px-3 py-1 bg-muted/50 rounded-full border border-border/20">
                    {formatDateDivider(msg.createdAt)}
                  </span>
                  <div className="flex-1 border-t border-border/30" />
                </div>
              )}

              {msg.isSystem ? (
                <div className="text-center py-2 my-1">
                  <span className="text-xs text-muted-foreground/70 font-light px-3 py-1 bg-muted/50 rounded-full border border-border/20">
                    {msg.content}
                  </span>
                </div>
              ) : isMyMessage ? (
                /* 내 메시지 - 오른쪽, iMessage 스타일 하늘색 */
                <div className="flex justify-end items-end gap-2 mb-3">
                  <span className="text-[10px] text-muted-foreground/50 font-light shrink-0">
                    {formatTime(msg.createdAt)}
                  </span>
                  <div className="max-w-[75%] px-4 py-2.5 bg-sky-400 text-white rounded-2xl rounded-br-sm">
                    <p className="text-sm font-normal whitespace-pre-wrap break-words leading-relaxed">
                      {msg.content}
                    </p>
                  </div>
                </div>
              ) : (
                /* 다른 사람 메시지 - 왼쪽, 연한 배경 */
                <div className="flex items-start gap-2 mb-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-200 to-gray-100 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center text-xs font-semibold text-gray-600 dark:text-gray-300 shrink-0">
                    {msg.displayName?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                  <div className="flex flex-col max-w-[75%]">
                    <span className="text-xs text-muted-foreground/60 font-medium mb-1 ml-1">
                      {msg.displayName || "멤버"}
                    </span>
                    <div className="flex items-end gap-2">
                      <div className="px-4 py-2.5 bg-gray-50 dark:bg-gray-800/70 text-gray-800 dark:text-gray-200 rounded-2xl rounded-bl-sm border border-gray-100 dark:border-gray-700/50">
                        <p className="text-sm font-normal whitespace-pre-wrap break-words leading-relaxed">
                          {msg.content}
                        </p>
                      </div>
                      <span className="text-[10px] text-muted-foreground/50 font-light shrink-0">
                        {formatTime(msg.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </React.Fragment>
          );
        })}

        <div ref={messagesEndRef} />
      </div>

      {/* 입력 영역 */}
      <div className="p-3 border-t border-border/20 bg-muted-foreground/5 shrink-0">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isConnected ? "메시지를 입력하세요..." : "연결 중..."}
            disabled={!isConnected || isSending}
            className="flex-1 px-4 py-2 bg-background border border-border/20 rounded-lg text-sm font-light placeholder:text-muted-foreground/40 focus:outline-none focus:border-border/40 disabled:opacity-50"
            maxLength={1000}
          />
          <button
            onClick={handleSend}
            disabled={!isConnected || isSending || !inputValue.trim()}
            className="px-4 py-2 bg-foreground text-background rounded-lg text-sm font-light hover:bg-foreground/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSending ? "..." : "전송"}
          </button>
        </div>
      </div>
    </div>
  );
};
