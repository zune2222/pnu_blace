'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/entities/auth';
import { logger } from '@/shared/lib/logger';

export interface RoomChatMessage {
  messageId: string;
  roomNo: string;
  anonymousName: string;
  content: string;
  createdAt: string;
}

export interface FloatingMessage extends RoomChatMessage {
  id: string;
  xPosition: number;
}

// Socket response types
interface JoinRoomResponse {
  success: boolean;
  anonymousName?: string;
  error?: string;
}

interface SendMessageResponse {
  success: boolean;
  error?: string;
}

interface GetMessagesResponse {
  success: boolean;
  messages?: RoomChatMessage[];
  error?: string;
}

export const useRoomChat = (roomNo: string | null) => {
  const { token } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const timeoutIdsRef = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());
  const [isConnected, setIsConnected] = useState(false);
  const [myNickname, setMyNickname] = useState<string | null>(null);
  const [messages, setMessages] = useState<FloatingMessage[]>([]);
  const [historyMessages, setHistoryMessages] = useState<RoomChatMessage[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Cleanup all timeouts on unmount
  useEffect(() => {
    const timeoutIds = timeoutIdsRef.current;
    return () => {
      timeoutIds.forEach((id) => clearTimeout(id));
      timeoutIds.clear();
    };
  }, []);

  // 플로팅 메시지 추가 (5초 후 자동 제거)
  const addFloatingMessage = useCallback((msg: RoomChatMessage) => {
    const floatingMsg: FloatingMessage = {
      ...msg,
      id: `${msg.messageId}-${Date.now()}`,
      xPosition: Math.random() * 70 + 5, // 5% ~ 75%
    };

    setMessages((prev) => [...prev, floatingMsg]);

    // 5초 후 제거 (cleanup을 위해 timeout ID 저장)
    const timeoutId = setTimeout(() => {
      setMessages((prev) => prev.filter(m => m.id !== floatingMsg.id));
      timeoutIdsRef.current.delete(timeoutId);
    }, 5000);
    timeoutIdsRef.current.add(timeoutId);
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
      logger.socket.connected(socket.id ?? 'unknown');
      setIsConnected(true);
      
      // 방 입장
      socket.emit('joinRoom', { roomNo }, (response: JoinRoomResponse) => {
        logger.socket.event('🚪', 'Join room response', response);
        if (response.success && response.anonymousName) {
          setMyNickname(response.anonymousName);
        }
      });
    });

    socket.on('disconnect', (reason) => {
      logger.socket.disconnected(reason);
      setIsConnected(false);
    });

    socket.on('newMessage', (message: RoomChatMessage) => {
      logger.socket.message('New message', message);
      addFloatingMessage(message);
    });

    socket.on('connect_error', (error) => {
      logger.socket.error(error);
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
      (response: SendMessageResponse) => {
        logger.socket.event('📤', 'Send message response', response);
        if (!response.success) {
          logger.error('Failed to send message:', response.error);
        }
      }
    );
  }, [roomNo]);

  // 채팅 내역 조회 (페이지네이션)
  const loadMessages = useCallback((before?: string) => {
    if (!socketRef.current || !roomNo) {
      logger.warn('Socket or roomNo not available');
      return;
    }

    if (isLoadingHistory) return;

    logger.socket.event('📥', 'Loading messages for room', { roomNo, before });
    setIsLoadingHistory(true);

    socketRef.current.emit(
      'getMessages',
      { roomNo, before },
      (response: GetMessagesResponse) => {
        logger.socket.event('📥', 'Messages response', response);
        setIsLoadingHistory(false);
        
        if (response.success) {
          const newMessages = response.messages || [];
          
          // 50개 미만이면 더 이상 없음
          if (newMessages.length < 50) {
            setHasMore(false);
          }
          
          setHistoryMessages(prev => {
            if (before) {
              // 중복 제거: 새로운 메시지 중 기존에 없는 것만 추가
              const existingIds = new Set(prev.map((msg: RoomChatMessage) => msg.messageId));
              const uniqueNewMessages = newMessages.filter((msg: RoomChatMessage) => !existingIds.has(msg.messageId));
              
              // 이전 메시지들을 앞에 추가 (과거 -> 현재 순서 유지)
              return [...uniqueNewMessages, ...prev];
            } else {
              // 첫 로드시 전체 교체
              return newMessages;
            }
          });
        } else {
          logger.error('Failed to load messages:', response.error);
        }
      }
    );
  }, [roomNo, isLoadingHistory]);

  // 더 많은 메시지 로드 (무한 스크롤)
  const loadMoreMessages = useCallback(() => {
    if (!hasMore || isLoadingHistory || historyMessages.length === 0) return;
    
    // 가장 오래된 메시지의 시간을 before로 사용
    const oldestMessage = historyMessages[0];
    if (oldestMessage) {
      loadMessages(oldestMessage.createdAt);
    }
  }, [hasMore, isLoadingHistory, historyMessages, loadMessages]);

  // 히스토리 모달 열기
  const openHistory = useCallback(() => {
    setIsHistoryOpen(true);
    setHasMore(true);
    setHistoryMessages([]);
    loadMessages(); // 최신 메시지부터 로드
  }, [loadMessages]);

  // 히스토리 모달 닫기
  const closeHistory = useCallback(() => {
    setIsHistoryOpen(false);
    setHistoryMessages([]);
    setHasMore(true);
    setIsLoadingHistory(false);
  }, []);

  return {
    isConnected,
    myNickname,
    messages,
    historyMessages,
    isHistoryOpen,
    hasMore,
    isLoadingHistory,
    sendMessage,
    openHistory,
    closeHistory,
    loadMoreMessages,
  };
};