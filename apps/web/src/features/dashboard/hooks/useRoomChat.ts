'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/entities/auth';

export interface RoomChatMessage {
  messageId: string;
  roomNo: string;
  anonymousName: string;
  content: string;
  createdAt: string;
}

interface FloatingMessage extends RoomChatMessage {
  id: string;
  xPosition: number;
}

export const useRoomChat = (roomNo: string | null) => {
  const { token } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [myNickname, setMyNickname] = useState<string | null>(null);
  const [messages, setMessages] = useState<FloatingMessage[]>([]);
  const [historyMessages, setHistoryMessages] = useState<RoomChatMessage[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // 플로팅 메시지 추가 (5초 후 자동 제거)
  const addFloatingMessage = useCallback((msg: RoomChatMessage) => {
    const floatingMsg: FloatingMessage = {
      ...msg,
      id: `${msg.messageId}-${Date.now()}`,
      xPosition: Math.random() * 70 + 5, // 5% ~ 75%
    };

    setMessages((prev) => [...prev, floatingMsg]);

    // 5초 후 제거
    setTimeout(() => {
      setMessages((prev) => prev.filter(m => m.id !== floatingMsg.id));
    }, 5000);
  }, []);

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
      console.log('🔗 Room chat connected:', socket.id);
      setIsConnected(true);
      
      // 방 입장
      socket.emit('joinRoom', { roomNo }, (response: any) => {
        console.log('🚪 Join room response:', response);
        if (response.success) {
          setMyNickname(response.anonymousName);
        }
      });
    });

    socket.on('disconnect', (reason) => {
      console.log('🔌 Room chat disconnected:', reason);
      setIsConnected(false);
    });

    socket.on('newMessage', (message: RoomChatMessage) => {
      console.log('📩 New message:', message);
      addFloatingMessage(message);
    });

    socket.on('connect_error', (error) => {
      console.error('❌ Connection error:', error);
    });

    return () => {
      if (socket.connected) {
        socket.emit('leaveRoom', { roomNo });
      }
      socket.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    };
  }, [roomNo, token, addFloatingMessage]);

  // 메시지 전송
  const sendMessage = useCallback((content: string) => {
    if (!socketRef.current || !roomNo || !content.trim()) return;

    socketRef.current.emit(
      'sendMessage',
      { roomNo, content: content.trim() },
      (response: any) => {
        console.log('📤 Send message response:', response);
        if (!response.success) {
          console.error('Failed to send message:', response.error);
        }
      }
    );
  }, [roomNo]);

  // 채팅 내역 조회
  const loadHistory = useCallback(() => {
    if (!socketRef.current || !roomNo) {
      console.warn('Socket or roomNo not available');
      return;
    }

    console.log('📥 Loading history for room:', roomNo);

    socketRef.current.emit(
      'getMessages',
      { roomNo },
      (response: any) => {
        console.log('📥 History response:', response);
        if (response.success) {
          setHistoryMessages(response.messages);
        } else {
          console.error('Failed to load history:', response.error);
        }
      }
    );
  }, [roomNo]);

  // 히스토리 모달 열기
  const openHistory = useCallback(() => {
    setIsHistoryOpen(true);
    loadHistory();
  }, [loadHistory]);

  // 히스토리 모달 닫기
  const closeHistory = useCallback(() => {
    setIsHistoryOpen(false);
    setHistoryMessages([]);
  }, []);

  return {
    isConnected,
    myNickname,
    messages,
    historyMessages,
    isHistoryOpen,
    sendMessage,
    openHistory,
    closeHistory,
  };
};