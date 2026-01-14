'use client';

import React, { useState, useCallback } from 'react';
import { MessageCircle, Send, History } from 'lucide-react';

interface RoomChatInputProps {
  myNickname: string | null;
  isConnected: boolean;
  onSendMessage: (content: string) => void;
  onOpenHistory: () => void;
}

export const RoomChatInput: React.FC<RoomChatInputProps> = ({
  myNickname,
  isConnected,
  onSendMessage,
  onOpenHistory,
}) => {
  const [message, setMessage] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !isConnected) return;
    
    onSendMessage(message);
    setMessage('');
  }, [message, isConnected, onSendMessage]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      if (e.nativeEvent.isComposing) return; // 한글 조합 중일 때는 전송 막기
      e.preventDefault();
      handleSubmit(e);
    }
  }, [handleSubmit]);

  return (
    <div className="fixed bottom-24 md:bottom-0 left-0 right-0 z-50 pb-safe">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-4">
        <div className="bg-background/95 dark:bg-background/98 backdrop-blur-lg border border-border/30 rounded-2xl shadow-xl">
          {/* 연결 상태 & 닉네임 표시 (확장 시) */}
          {isExpanded && myNickname && (
            <div className="px-4 pt-3 pb-2 border-b border-border/20">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  <span className={`inline-block w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`} />
                  {myNickname}님으로 채팅 중
                </span>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  접기
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex items-center gap-2 p-3">
            {/* 채팅 아이콘 (미확장 시) */}
            {!isExpanded && (
              <button
                type="button"
                onClick={() => setIsExpanded(true)}
                className="p-2 rounded-full hover:bg-muted/50 transition-colors"
              >
                <MessageCircle className="w-5 h-5 text-muted-foreground" />
              </button>
            )}

            {/* 입력창 */}
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onFocus={() => setIsExpanded(true)}
              onKeyDown={handleKeyDown}
              placeholder={isExpanded ? "열람실 친구들에게 메시지 보내기..." : "채팅하기..."}
              maxLength={200}
              disabled={!isConnected}
              className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-muted-foreground/60 disabled:opacity-50"
            />

            {/* 전송 버튼 */}
            <button
              type="submit"
              disabled={!message.trim() || !isConnected}
              className="p-2 rounded-full bg-foreground text-background disabled:opacity-30 disabled:cursor-not-allowed hover:bg-foreground/90 transition-all"
            >
              <Send className="w-4 h-4" />
            </button>

            {/* 히스토리 버튼 */}
            <button
              type="button"
              onClick={onOpenHistory}
              className="p-2 rounded-full hover:bg-muted/50 transition-colors"
              title="오늘 채팅 내역"
            >
              <History className="w-5 h-5 text-muted-foreground" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
