'use client';

import React from 'react';
import { FloatingMessage } from '../hooks/useRoomChat';

interface FloatingChatLayerProps {
  messages: FloatingMessage[];
}

export const FloatingChatLayer: React.FC<FloatingChatLayerProps> = ({ messages }) => {
  if (messages.length === 0) return null;

  return (
    <div className="fixed inset-x-0 top-0 bottom-24 pointer-events-none overflow-hidden z-30">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className="absolute animate-float-up"
          style={{
            left: `${msg.xPosition}%`,
            bottom: '120px',
          }}
        >
          <div className="bg-background/80 dark:bg-background/90 backdrop-blur-md border border-border/30 rounded-full px-4 py-2 shadow-lg max-w-xs">
            <span className="text-sm">
              <span className="font-medium text-foreground/90">{msg.anonymousName}</span>
              <span className="text-muted-foreground mx-1.5">·</span>
              <span className="text-foreground/80">{msg.content}</span>
            </span>
          </div>
        </div>
      ))}

      <style jsx>{`
        @keyframes float-up {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          10% {
            opacity: 1;
          }
          80% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            transform: translateY(-100px);
          }
        }
        .animate-float-up {
          animation: float-up 5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};
