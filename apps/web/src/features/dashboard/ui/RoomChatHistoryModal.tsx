'use client';

import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { RoomChatMessage } from '../hooks/useRoomChat';

interface RoomChatHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  messages: RoomChatMessage[];
  roomName?: string;
  hasMore?: boolean;
  isLoading?: boolean;
  onLoadMore?: () => void;
}

export const RoomChatHistoryModal: React.FC<RoomChatHistoryModalProps> = ({
  isOpen,
  onClose,
  messages,
  roomName,
  hasMore = false,
  isLoading = false,
  onLoadMore,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // 무한 스크롤 구현
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || !onLoadMore) return;

    const handleScroll = () => {
      const { scrollTop } = container;
      
      // 스크롤이 맨 위에 가까워지면 더 로드
      if (scrollTop <= 100 && hasMore && !isLoading) {
        console.log('🔄 Loading more messages...');
        onLoadMore();
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [hasMore, isLoading, onLoadMore]);

  if (!isOpen) return null;

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-zinc-900 border border-border/30 rounded-2xl shadow-2xl w-full max-w-md mx-4 max-h-[70vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex-none flex items-center justify-between px-5 py-4 border-b border-border/20">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">오늘의 채팅</h2>
            {roomName && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{roomName}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors -mr-2"
          >
            <X className="w-5 h-5 text-black dark:text-white" />
          </button>
        </div>

        {/* Messages */}
        <div 
          ref={scrollContainerRef}
          className="flex-1 min-h-0 overflow-y-auto px-5 py-4 space-y-4"
        >
          {/* Loading indicator at top */}
          {isLoading && (
            <div className="flex justify-center py-2">
              <div className="text-xs text-gray-500 dark:text-gray-400">
                이전 메시지를 불러오는 중...
              </div>
            </div>
          )}
          
          {messages.length === 0 && !isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">오늘 채팅 내역이 없습니다.</p>
              <p className="text-xs mt-1 opacity-70">첫 번째 메시지를 보내보세요!</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div key={msg.messageId} className="space-y-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                    {msg.anonymousName}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {formatTime(msg.createdAt)}
                  </span>
                </div>
                <p className="text-sm text-gray-800 dark:text-gray-200 pl-0.5 whitespace-pre-wrap break-words">
                  {msg.content}
                </p>
              </div>
            ))
          )}
          
          {/* Load more indicator */}
          {messages.length > 0 && !hasMore && (
            <div className="text-center py-4 text-xs text-gray-400">
              모든 메시지를 불러왔습니다
            </div>
          )}
        </div>
      </div>
    </div>
  );
};