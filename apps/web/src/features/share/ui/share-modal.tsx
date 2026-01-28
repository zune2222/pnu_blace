"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Download, Share2, Loader2 } from "lucide-react";
import { StoryCardTemplate, StoryCardTemplateProps } from "./story-card-template";
import { Emoji } from "@/shared/ui";
import { generateStoryImage, shareImage, downloadImage, canShareFiles } from "../lib";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  cardData: StoryCardTemplateProps;
}

export function ShareModal({ isOpen, onClose, cardData }: ShareModalProps) {
  const hiddenCardRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const generateImage = useCallback(async (): Promise<Blob | null> => {
    if (!hiddenCardRef.current) return null;
    await new Promise((resolve) => setTimeout(resolve, 100));
    return generateStoryImage(hiddenCardRef.current);
  }, []);

  const handleDownload = useCallback(async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const blob = await generateImage();
      if (blob) {
        downloadImage(blob, `pnu-blace-${Date.now()}.png`);
      } else {
        throw new Error("이미지 생성 실패");
      }
    } catch (err) {
      setError("이미지 생성에 실패했습니다. 다시 시도해주세요.");
      console.error("Image generation error:", err);
    } finally {
      setIsGenerating(false);
    }
  }, [generateImage]);

  const handleShare = useCallback(async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const blob = await generateImage();
      if (!blob) {
        throw new Error("이미지 생성 실패");
      }

      const shared = await shareImage(blob);
      if (!shared) {
        downloadImage(blob, `pnu-blace-${Date.now()}.png`);
      }
    } catch (err) {
      setError("공유에 실패했습니다. 다시 시도해주세요.");
      console.error("Share error:", err);
    } finally {
      setIsGenerating(false);
    }
  }, [generateImage]);

  if (!isOpen) return null;

  const canShare = canShareFiles();

  // 미리보기 렌더링
  const renderPreview = () => {
    switch (cardData.cardType) {
      case "dashboard":
        return (
          <>
            <div className="text-center mb-5">
              <div className="text-[10px] text-gray-400 uppercase tracking-[0.3em] mb-1">Today</div>
              <div className="text-5xl font-extralight text-gray-900 tracking-tight">
                {cardData.todayHours.toFixed(1)}
                <span className="text-base font-light text-gray-500 ml-1">hours</span>
              </div>
              <div className="text-[10px] text-gray-400 mt-1">오늘 공부한 시간</div>
            </div>
            <div className="w-10 h-px bg-gray-200 mb-5" />
            <div className="text-center mb-5">
              <div className="text-[10px] text-gray-400 uppercase tracking-[0.3em] mb-1">This Week</div>
              <div className="text-3xl font-light text-gray-900">
                {cardData.weeklyHours.toFixed(1)}
                <span className="text-sm font-light text-gray-500 ml-1">hours</span>
              </div>
              <div className="text-[10px] text-gray-400 mt-1">이번 주 누적</div>
            </div>
            <div className="bg-[#F5F8FC] border border-[#E0E8F0] rounded-full px-4 py-2 text-sm">
              <span className="text-gray-500">상위 </span>
              <span className="font-bold text-[#0055A8]">
                {cardData.percentile !== undefined ? `${100 - cardData.percentile}%` : "-"}
              </span>
            </div>
          </>
        );

      case "stats":
        return (
          <>
            <div className="text-center mb-5">
              <div className="text-[10px] text-gray-400 uppercase tracking-[0.3em] mb-1">Total</div>
              <div className="text-5xl font-extralight text-gray-900 tracking-tight">
                {cardData.totalHours.toFixed(1)}
                <span className="text-base font-light text-gray-500 ml-1">hours</span>
              </div>
              <div className="text-[10px] text-gray-400 mt-1">총 공부 시간</div>
            </div>
            <div className="w-10 h-px bg-gray-200 mb-5" />
            <div className="text-center mb-5">
              <div className="text-[10px] text-gray-400 uppercase tracking-[0.3em] mb-1">Attendance</div>
              <div className="text-3xl font-light text-gray-900">
                {cardData.totalDays}
                <span className="text-sm font-light text-gray-500 ml-1">days</span>
              </div>
              <div className="text-[10px] text-gray-400 mt-1">총 출석일</div>
            </div>
            {cardData.currentStreak !== undefined && cardData.currentStreak > 0 && (
              <div className="bg-[#F5F8FC] border border-[#E0E8F0] rounded-full px-4 py-2 text-sm flex items-center gap-2">
                <Emoji>🔥</Emoji>
                <span className="font-semibold text-[#0055A8]">{cardData.currentStreak}일 연속</span>
              </div>
            )}
          </>
        );

      case "ranking":
        return (
          <>
            <div className="text-center mb-5">
              <div className="text-[10px] text-gray-400 uppercase tracking-[0.3em] mb-1">Rank</div>
              <div className="text-5xl font-extralight text-gray-900 tracking-tight">
                <span className="text-2xl font-light text-gray-500">#</span>
                {cardData.rank}
              </div>
              <div className="text-[10px] text-gray-400 mt-1">{cardData.totalUsers.toLocaleString()}명 중</div>
            </div>
            <div className="w-10 h-px bg-gray-200 mb-5" />
            <div className="bg-[#F5F8FC] border border-[#E0E8F0] rounded-full px-4 py-2 text-sm">
              <span className="text-gray-500">상위 </span>
              <span className="font-bold text-[#0055A8]">
                {cardData.percentile !== undefined ? `${100 - cardData.percentile}%` : "-"}
              </span>
            </div>
          </>
        );
    }
  };

  return (
    <>
      {/* 숨겨진 원본 크기 카드 */}
      {mounted && createPortal(
        <div
          style={{
            position: "fixed",
            left: "-9999px",
            top: 0,
            width: "1080px",
            height: "1920px",
            overflow: "hidden",
            pointerEvents: "none",
          }}
        >
          <StoryCardTemplate ref={hiddenCardRef} {...cardData} />
        </div>,
        document.body
      )}

      {/* 백드롭 */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" onClick={onClose} />

      {/* 모달 */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="relative bg-background border border-border rounded-2xl shadow-2xl w-full max-w-sm pointer-events-auto overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 헤더 */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="text-lg font-medium text-foreground">공부 기록 공유</h2>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted transition-colors" aria-label="닫기">
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          {/* 미리보기 */}
          <div className="p-4">
            <div
              className="relative bg-gradient-to-b from-[#FAFAFA] via-white to-[#FAFAFA] rounded-xl overflow-hidden mx-auto shadow-lg border border-gray-100"
              style={{ aspectRatio: "9/16", maxHeight: "400px" }}
            >
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
                {/* 로고 */}
                <div className="text-center mb-5">
                  <div className="text-lg font-black text-gray-900">PNU Blace</div>
                  <div className="text-[10px] text-gray-400 mt-1 tracking-wider">Bridge + Place</div>
                </div>

                {renderPreview()}
              </div>

              {/* 코너 장식 */}
              <div className="absolute top-3 left-3 w-3 h-3 border-l border-t border-gray-200" />
              <div className="absolute top-3 right-3 w-3 h-3 border-r border-t border-gray-200" />
              <div className="absolute bottom-3 left-3 w-3 h-3 border-l border-b border-gray-200" />
              <div className="absolute bottom-3 right-3 w-3 h-3 border-r border-b border-gray-200" />
            </div>

            <p className="text-center text-sm text-muted-foreground mt-4 break-keep">
              이미지를 저장하고 인스타그램 스토리에 공유해보세요!
            </p>

            {error && <p className="text-center text-sm text-red-500 mt-2">{error}</p>}
          </div>

          {/* 액션 버튼 */}
          <div className="p-4 pt-0 flex gap-3">
            <button
              onClick={handleDownload}
              disabled={isGenerating}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-muted hover:bg-muted/80 text-foreground rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
              <span>이미지 저장</span>
            </button>

            {canShare && (
              <button
                onClick={handleShare}
                disabled={isGenerating}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-foreground text-background rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-foreground/90"
              >
                {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Share2 className="w-5 h-5" />}
                <span>공유하기</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
