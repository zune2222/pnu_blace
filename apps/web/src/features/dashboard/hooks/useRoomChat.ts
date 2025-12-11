'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/entities/auth';

export interface FloatingMessage {
  messageId: string;
  anonymousName: string;
  content: string;
  createdAt: string;
  // UI용 필드
  id: string; // 애니메이션 키
  xPosition: number; // 랜덤 X 위치 (0-80%)
}

export interface RoomChatMessage {
  messageId: string;
  roomNo: string;
  anonymousName: string;
  content: string;
  createdAt: string;
}

interface UseRoomChatOptions {
  onNewMessage?: (message: FloatingMessage) => void;
}

export const useRoomChat = (roomNo: string | null, options?: UseRoomChatOptions) => {
  const { token } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [myNickname, setMyNickname] = useState<string | null>(null);
  const [messages, setMessages] = useState<FloatingMessage[]>([]);
  const [todayHistory, setTodayHistory] = useState<RoomChatMessage[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // 메시지 자동 제거 (5초 후)
  const addMessage = useCallback((msg: RoomChatMessage) => {
    const floatingMsg: FloatingMessage = {
      ...msg,
      id: `${msg.messageId}-${Date.now()}`,
      xPosition: Math.random() * 70 + 5, // 5% ~ 75%
    };

    setMessages((prev) => [...prev, floatingMsg]);
    options?.onNewMessage?.(floatingMsg);

    // 5초 후 제거
    setTimeout(() => {
      setMessages((prev) => prev.filter((m) => m.id !== floatingMsg.id));
    }, 5000);
  }, [options]);

  // 소켓 연결
  useEffect(() => {
    if (!roomNo || !token) return;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    
    const socket = io(`${apiUrl}/room-chat`, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      // 방 입장
      socket.emit('joinRoom', { roomNo }, (response: any) => {
        if (response.success) {
          setMyNickname(response.anonymousName);
        }
      });
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('newMessage', (message: RoomChatMessage) => {
      addMessage(message);
    });

    return () => {
      if (socket.connected) {
        socket.emit('leaveRoom', { roomNo });
      }
      socket.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    };
  }, [roomNo, token, addMessage]);

  // 메시지 전송
  const sendMessage = useCallback((content: string) => {
    if (!socketRef.current || !roomNo || !content.trim()) return;

    socketRef.current.emit(
      'sendMessage',
      { roomNo, content: content.trim() },
      (response: any) => {
        if (!response.success) {
          console.error('Failed to send message:', response.error);
        }
      }
    );
  }, [roomNo]);

  // 오늘 채팅 내역 조회
  const loadTodayHistory = useCallback(() => {
    if (!socketRef.current || !roomNo) return;

    socketRef.current.emit(
      'getTodayHistory',
      { roomNo },
      (response: any) => {
        if (response.success) {
          setTodayHistory(response.messages);
        }
      }
    );
  }, [roomNo]);

  // 히스토리 모달 열기
  const openHistory = useCallback(() => {
    loadTodayHistory();
    setIsHistoryOpen(true);
  }, [loadTodayHistory]);

  const closeHistory = useCallback(() => {
    setIsHistoryOpen(false);
  }, []);

  return {
    isConnected,
    myNickname,
    messages,
    todayHistory,
    isHistoryOpen,
    sendMessage,
    openHistory,
    closeHistory,
  };
};
