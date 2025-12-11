"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "@/entities/auth";

export interface ChatMessage {
  messageId: string;
  groupId: string;
  studentId: string;
  displayName: string;
  content: string;
  createdAt: string;
  isSystem: boolean;
}

interface UseStudyChatReturn {
  messages: ChatMessage[];
  isConnected: boolean;
  userCount: number;
  unreadCount: number;
  sendMessage: (content: string) => Promise<boolean>;
  loadMore: () => Promise<void>;
  resetUnread: () => void;
  hasMore: boolean;
  isLoading: boolean;
}

export function useStudyChat(groupId: string): UseStudyChatReturn {
  const { token, isAuthenticated } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [userCount, setUserCount] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Socket 연결
  useEffect(() => {
    if (!isAuthenticated || !token || !groupId) return;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
    
    const socket = io(`${apiUrl}/chat`, {
      auth: { token },
      transports: ["websocket", "polling"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setIsConnected(true);
      // 방 입장
      socket.emit("joinRoom", { groupId }, (response: any) => {
        if (response.success && response.messages) {
          setMessages(response.messages);
          setHasMore(response.messages.length >= 50);
        }
      });
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    socket.on("newMessage", (message: ChatMessage) => {
      setMessages((prev) => [...prev, message]);
      // 새 메시지 수신 시 unreadCount 증가
      setUnreadCount((prev) => prev + 1);
    });

    socket.on("userCount", (data: { roomId: string; count: number }) => {
      if (data.roomId === groupId) {
        setUserCount(data.count);
      }
    });

    return () => {
      socket.emit("leaveRoom", { groupId });
      socket.disconnect();
      socketRef.current = null;
    };
  }, [groupId, token, isAuthenticated]);

  // 메시지 전송
  const sendMessage = useCallback(async (content: string): Promise<boolean> => {
    if (!socketRef.current || !isConnected) return false;

    return new Promise((resolve) => {
      socketRef.current!.emit(
        "sendMessage",
        { groupId, content },
        (response: any) => {
          resolve(response.success);
        }
      );
    });
  }, [groupId, isConnected]);

  // 이전 메시지 로드
  const loadMore = useCallback(async (): Promise<void> => {
    if (!socketRef.current || !isConnected || !hasMore || isLoading) return;
    if (messages.length === 0) return;

    setIsLoading(true);
    const oldestMessage = messages[0];
    if (!oldestMessage) {
      setIsLoading(false);
      return;
    }

    socketRef.current.emit(
      "loadMore",
      { groupId, before: oldestMessage.createdAt },
      (response: any) => {
        if (response.success && response.messages) {
          if (response.messages.length < 50) {
            setHasMore(false);
          }
          setMessages((prev) => [...response.messages, ...prev]);
        }
        setIsLoading(false);
      }
    );
  }, [groupId, isConnected, hasMore, isLoading, messages]);

  // 읽지 않은 메시지 카운트 리셋
  const resetUnread = useCallback(() => {
    setUnreadCount(0);
  }, []);

  return {
    messages,
    isConnected,
    userCount,
    unreadCount,
    sendMessage,
    loadMore,
    resetUnread,
    hasMore,
    isLoading,
  };
}
