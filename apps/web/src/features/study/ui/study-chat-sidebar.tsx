"use client";

import React, { useState, useRef, useEffect } from "react";
import { useStudyChat, ChatMessage } from "@/entities/study/model/use-study-chat";
import { useAuth } from "@/entities/auth";

interface StudyChatSidebarProps {
  groupId: string;
  defaultOpen?: boolean;
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
    month: "short",
    day: "numeric",
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

export const StudyChatSidebar: React.FC<StudyChatSidebarProps> = ({
  groupId,
  defaultOpen = true,
}) => {
  const { user, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  const {
    messages,
    isConnected,
    userCount,
    sendMessage,
    loadMore,
    hasMore,
    isLoading,
  } = useStudyChat(groupId, isOpen);
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);

  // 새 메시지 시 자동 스크롤
  useEffect(() => {
    if (isAtBottom && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isAtBottom]);

  // 스크롤 위치 감지
  const handleScroll = () => {
    if (!messagesContainerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } =
      messagesContainerRef.current;

    setIsAtBottom(scrollHeight - scrollTop - clientHeight < 50);

    if (scrollTop < 50 && hasMore && !isLoading) {
      loadMore();
    }
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
  };

  // Enter 키로 전송
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // 플로팅 버튼 (닫혀있을 때)
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-foreground text-background rounded-full shadow-lg flex items-center justify-center hover:bg-foreground/90 transition-all z-50"
      >
        <span className="text-xl">💬</span>
        {messages.length > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {messages.length > 9 ? "9+" : messages.length}
          </span>
        )}
      </button>
    );
  }

  return (
    <>
      {/* 오버레이 (모바일) */}
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
        onClick={() => setIsOpen(false)}
      />

      {/* 사이드바 */}
      <div className="fixed top-0 right-0 h-full w-full sm:w-96 bg-background border-l border-border/20 shadow-xl z-50 flex flex-col animate-in slide-in-from-right duration-200">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/20 bg-muted-foreground/5 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-light text-foreground">
              💬 스터디 채팅
            </span>
            <span
              className={`w-2 h-2 rounded-full ${
                isConnected ? "bg-green-500" : "bg-red-500"
              }`}
            />
            <span className="text-xs text-muted-foreground/60 font-light">
              {userCount}명
            </span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted-foreground/10 transition-colors"
          >
            <span className="text-lg">✕</span>
          </button>
        </div>

        {/* 로그인 필요 안내 */}
        {!isAuthenticated ? (
          <div className="flex-1 flex items-center justify-center p-6">
            <p className="text-muted-foreground/60 font-light text-center">
              로그인하면 채팅에 참여할 수 있습니다.
            </p>
          </div>
        ) : (
          <>
            {/* 메시지 영역 */}
            <div
              ref={messagesContainerRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto p-4 space-y-3"
            >
              {isLoading && (
                <div className="text-center py-2">
                  <span className="text-xs text-muted-foreground/50">
                    불러오는 중...
                  </span>
                </div>
              )}

              {messages.length === 0 && !isLoading && (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground/50 font-light text-sm text-center">
                    아직 메시지가 없습니다.
                    <br />
                    첫 번째로 인사해보세요! 👋
                  </p>
                </div>
              )}

              {messages.map((msg, index) => {
                const showDateDivider = shouldShowDateDivider(
                  msg,
                  messages[index - 1]
                );
                const isMyMessage = msg.studentId === user?.studentId;

                return (
                  <React.Fragment key={msg.messageId}>
                    {showDateDivider && (
                      <div className="flex items-center gap-2 py-1">
                        <div className="flex-1 border-t border-border/20" />
                        <span className="text-xs text-muted-foreground/50 font-light">
                          {formatDateDivider(msg.createdAt)}
                        </span>
                        <div className="flex-1 border-t border-border/20" />
                      </div>
                    )}

                    {msg.isSystem ? (
                      <div className="text-center py-1">
                        <span className="text-xs text-muted-foreground/50 font-light">
                          {msg.content}
                        </span>
                      </div>
                    ) : (
                      <div
                        className={`flex ${
                          isMyMessage ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div className="max-w-[85%]">
                          {!isMyMessage && (
                            <span className="text-xs text-muted-foreground/60 font-light ml-1 mb-0.5 block">
                              {msg.displayName}
                            </span>
                          )}
                          <div
                            className={`px-3 py-2 rounded-lg ${
                              isMyMessage
                                ? "bg-foreground text-background"
                                : "bg-muted-foreground/10 text-foreground"
                            }`}
                          >
                            <p className="text-sm font-light whitespace-pre-wrap break-words">
                              {msg.content}
                            </p>
                          </div>
                          <span
                            className={`text-xs text-muted-foreground/40 font-light mt-0.5 block ${
                              isMyMessage ? "text-right" : "text-left"
                            } mx-1`}
                          >
                            {formatTime(msg.createdAt)}
                          </span>
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
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={isConnected ? "메시지 입력..." : "연결 중..."}
                  disabled={!isConnected || isSending}
                  className="flex-1 px-3 py-2 bg-background border border-border/20 rounded-lg text-sm font-light placeholder:text-muted-foreground/40 focus:outline-none focus:border-border/40 disabled:opacity-50"
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
          </>
        )}
      </div>
    </>
  );
};
