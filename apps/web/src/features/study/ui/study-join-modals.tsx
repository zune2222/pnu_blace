"use client";

import React from "react";

interface JoinRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  displayName: string;
  setDisplayName: (value: string) => void;
  message: string;
  setMessage: (value: string) => void;
  onSubmit: () => void;
  isPending: boolean;
}

export const JoinRequestModal: React.FC<JoinRequestModalProps> = ({
  isOpen,
  onClose,
  displayName,
  setDisplayName,
  message,
  setMessage,
  onSubmit,
  isPending,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-background/95 rounded-lg p-4 md:p-6 max-w-md w-full border border-border/30 shadow-xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-light text-foreground mb-4">참가 신청</h3>
        <p className="text-sm text-muted-foreground/60 font-light mb-4">
          스터디장이 신청을 승인하면 가입됩니다.
        </p>
        <div className="space-y-3 mb-4">
          <div>
            <label className="block text-sm text-muted-foreground/60 font-light mb-2">
              스터디 닉네임
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="스터디에서 사용할 닉네임을 입력하세요"
              className="w-full px-4 py-3 bg-muted-foreground/5 border border-border/20 rounded-lg text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-border/40 font-light"
            />
          </div>
        </div>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="자기소개나 가입 이유를 적어주세요 (선택)"
          className="w-full px-4 py-3 bg-muted-foreground/5 border border-border/20 rounded-lg text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-border/40 font-light resize-none h-24 mb-4"
        />
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 min-h-[44px] bg-muted-foreground/10 text-foreground rounded-lg text-sm font-light hover:bg-muted-foreground/20 transition-all active:scale-95"
          >
            취소
          </button>
          <button
            onClick={onSubmit}
            disabled={isPending}
            className="flex-1 px-4 py-3 min-h-[44px] bg-foreground text-background rounded-lg text-sm font-light hover:bg-foreground/90 transition-all active:scale-95 disabled:opacity-50"
          >
            {isPending ? "신청 중..." : "신청하기"}
          </button>
        </div>
      </div>
    </div>
  );
};

interface PasswordJoinModalProps {
  isOpen: boolean;
  onClose: () => void;
  password: string;
  setPassword: (value: string) => void;
  displayName: string;
  setDisplayName: (value: string) => void;
  onSubmit: () => void;
  isPending: boolean;
}

export const PasswordJoinModal: React.FC<PasswordJoinModalProps> = ({
  isOpen,
  onClose,
  password,
  setPassword,
  displayName,
  setDisplayName,
  onSubmit,
  isPending,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-background/95 rounded-lg p-4 md:p-6 max-w-md w-full border border-border/30 shadow-xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-light text-foreground mb-4">
          비밀번호로 가입
        </h3>
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm text-muted-foreground/60 font-light mb-2">
              스터디 비밀번호
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호를 입력하세요"
              className="w-full px-4 py-3 bg-muted-foreground/5 border border-border/20 rounded-lg text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-border/40 font-light"
            />
          </div>
          <div>
            <label className="block text-sm text-muted-foreground/60 font-light mb-2">
              스터디 내 닉네임
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="스터디에서 사용할 닉네임"
              className="w-full px-4 py-3 bg-muted-foreground/5 border border-border/20 rounded-lg text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-border/40 font-light"
            />
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 min-h-[44px] bg-muted-foreground/10 text-foreground rounded-lg text-sm font-light hover:bg-muted-foreground/20 transition-all active:scale-95"
          >
            취소
          </button>
          <button
            onClick={onSubmit}
            disabled={isPending}
            className="flex-1 px-4 py-3 min-h-[44px] bg-foreground text-background rounded-lg text-sm font-light hover:bg-foreground/90 transition-all active:scale-95 disabled:opacity-50"
          >
            {isPending ? "가입 중..." : "가입하기"}
          </button>
        </div>
      </div>
    </div>
  );
};
