'use client';

import React from 'react';
import { X } from 'lucide-react';
import { RoomChatMessage } from '../hooks/useRoomChat';

interface RoomChatHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  messages: RoomChatMessage[];
  roomName?: string;
}

export const RoomChatHistoryModal: React.FC<RoomChatHistoryModalProps> = ({
  isOpen,
  onClose,
  messages,
  roomName,
}) => {
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
      <div className="relative bg-background border border-border/30 rounded-2xl shadow-2xl w-full max-w-md mx-4 max-h-[70vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/20">
          <div>
            <h2 className="text-lg font-medium text-foreground">오늘의 채팅</h2>
            {roomName && (
              <p className="text-sm text-muted-foreground mt-0.5">{roomName}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-muted/50 transition-colors -mr-2"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">오늘 채팅 내역이 없습니다.</p>
              <p className="text-xs mt-1 opacity-70">첫 번째 메시지를 보내보세요!</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div key={msg.messageId} className="space-y-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-medium text-foreground">
                    {msg.anonymousName}
                  </span>
                  <span className="text-xs text-muted-foreground/60">
                    {formatTime(msg.createdAt)}
                  </span>
                </div>
                <p className="text-sm text-foreground/80 pl-0.5">
                  {msg.content}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
