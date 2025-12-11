"use client";
import React from "react";
import Link from "next/link";
import { useAuth } from "@/entities/auth";
import {
  CurrentSeatWidget,
  FavoriteRoomsSection,
  MyDashboardRankings,
  FloatingChatLayer,
  RoomChatInput,
  RoomChatHistoryModal,
} from "./ui";
import { useDashboardData } from "./model";
import { useRoomChat } from "./hooks/useRoomChat";

// 로그인 유도 UI 컴포넌트
const LoginPrompt: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 lg:py-20">
        <div className="text-center space-y-6 sm:space-y-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extralight text-foreground">
            대시보드
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground/70 font-light max-w-xl mx-auto leading-relaxed">
            로그인하면 현재 좌석 정보, 즐겨찾기 열람실, 빠른 통계 등을 한눈에
            확인할 수 있어요.
          </p>

          {/* 미리보기 카드들 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto mt-8 sm:mt-12">
            <div className="p-4 sm:p-6 border border-border/20 rounded-lg text-left space-y-3">
              <div className="text-2xl">🪑</div>
              <h3 className="text-base sm:text-lg font-light text-foreground">현재 좌석</h3>
              <p className="text-sm text-muted-foreground/60 font-light leading-relaxed">
                예약한 좌석 정보와 남은 시간을 실시간으로 확인
              </p>
            </div>
            <div className="p-4 sm:p-6 border border-border/20 rounded-lg text-left space-y-3">
              <div className="text-2xl">⭐</div>
              <h3 className="text-base sm:text-lg font-light text-foreground">
                즐겨찾기 열람실
              </h3>
              <p className="text-sm text-muted-foreground/60 font-light leading-relaxed">
                자주 가는 열람실의 현황을 빠르게 확인
              </p>
            </div>
            <div className="p-4 sm:p-6 border border-border/20 rounded-lg text-left space-y-3 sm:col-span-2 lg:col-span-1">
              <div className="text-2xl">🏆</div>
              <h3 className="text-base sm:text-lg font-light text-foreground">내 랭킹</h3>
              <p className="text-sm text-muted-foreground/60 font-light leading-relaxed">
                이번 주와 전체 이용 랭킹 확인
              </p>
            </div>
          </div>

          <div className="pt-6 sm:pt-8">
            <Link
              href="/login"
              className="inline-block px-6 sm:px-8 py-3 bg-foreground text-background rounded-lg font-light hover:bg-foreground/90 transition-colors min-h-[44px] flex items-center justify-center active:scale-95"
            >
              로그인하고 시작하기
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

// 로그인된 사용자용 대시보드 콘텐츠 (훅 호출은 여기서만)
const AuthenticatedDashboard: React.FC = () => {
  const dashboardState = useDashboardData();
  
  // 좌석 예약 중일 때만 채팅 활성화
  const currentRoomNo = dashboardState.currentSeat?.roomNo || null;
  const currentRoomName = dashboardState.currentSeat?.roomName || undefined;
  
  const {
    isConnected,
    myNickname,
    messages,
    todayHistory,
    isHistoryOpen,
    sendMessage,
    openHistory,
    closeHistory,
  } = useRoomChat(currentRoomNo);

  return (
    <div className="min-h-screen bg-background">
      {/* 플로팅 채팅 레이어 - 좌석 예약 중일 때만 */}
      {currentRoomNo && <FloatingChatLayer messages={messages} />}

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* 메인 좌석 섹션 - 전체 너비 */}
        <div className="border-b border-border/20">
          <CurrentSeatWidget {...dashboardState} />
        </div>

        {/* 하단 섹션들 - 그리드 레이아웃 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 xl:gap-24 py-16 md:py-20">
          <div className="border-r-0 lg:border-r border-border/20 pb-8 lg:pb-0">
            <FavoriteRoomsSection
              favoriteRooms={dashboardState.favoriteRooms}
              isLoading={dashboardState.isLoading}
              error={dashboardState.error}
              toggleFavorite={dashboardState.toggleFavorite}
            />
          </div>
          <div>
            <MyDashboardRankings />
          </div>
        </div>
      </div>

      {/* 채팅 입력 UI - 좌석 예약 중일 때만 */}
      {currentRoomNo && (
        <RoomChatInput
          myNickname={myNickname}
          isConnected={isConnected}
          onSendMessage={sendMessage}
          onOpenHistory={openHistory}
        />
      )}

      {/* 채팅 히스토리 모달 */}
      <RoomChatHistoryModal
        isOpen={isHistoryOpen}
        onClose={closeHistory}
        messages={todayHistory}
        roomName={currentRoomName}
      />
    </div>
  );
};

export const DashboardPage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  // 비로그인 시 로그인 유도 UI (API 호출 없음)
  if (!isAuthenticated) {
    return <LoginPrompt />;
  }

  // 로그인 시에만 훅이 있는 컴포넌트 렌더링
  return <AuthenticatedDashboard />;
};

