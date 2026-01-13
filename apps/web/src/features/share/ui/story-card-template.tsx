"use client";

import React, { forwardRef } from "react";

export type CardType = "dashboard" | "stats" | "ranking";

interface BaseProps {
  cardType: CardType;
  currentStreak?: number;
}

interface DashboardCardProps extends BaseProps {
  cardType: "dashboard";
  todayHours: number;
  weeklyHours: number;
  percentile?: number;
}

interface StatsCardProps extends BaseProps {
  cardType: "stats";
  totalHours: number;
  totalDays: number;
}

interface RankingCardProps extends BaseProps {
  cardType: "ranking";
  rank: number;
  percentile?: number;
  totalUsers: number;
}

export type StoryCardTemplateProps = DashboardCardProps | StatsCardProps | RankingCardProps;

export const StoryCardTemplate = forwardRef<HTMLDivElement, StoryCardTemplateProps>(
  (props, ref) => {
    const { cardType, currentStreak } = props;

    const today = new Date();
    const dateStr = today.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "short",
    });

    const formatHours = (hours: number | undefined | null) => {
      const safeHours = typeof hours === "number" ? hours : 0;
      return safeHours.toFixed(1);
    };

    const formatNumber = (num: number | undefined | null) => {
      const safeNum = typeof num === "number" ? num : 0;
      return safeNum.toLocaleString();
    };

    // 상위 퍼센트 계산
    const getTopPercent = () => {
      if (cardType === "dashboard" || cardType === "ranking") {
        const percentile = (props as DashboardCardProps | RankingCardProps).percentile;
        return percentile !== undefined ? 100 - percentile : undefined;
      }
      return undefined;
    };

    const topPercent = getTopPercent();

    // 메인 콘텐츠 렌더링
    const renderMainContent = () => {
      switch (cardType) {
        case "dashboard":
          return <DashboardContent todayHours={props.todayHours} weeklyHours={props.weeklyHours} formatHours={formatHours} />;
        case "stats":
          return <StatsContent totalHours={props.totalHours} totalDays={props.totalDays} formatHours={formatHours} />;
        case "ranking":
          return <RankingContent rank={props.rank} totalUsers={props.totalUsers} formatNumber={formatNumber} />;
      }
    };

    // 하단 배지 렌더링
    const renderBadge = () => {
      switch (cardType) {
        case "dashboard":
        case "ranking":
          return (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "24px 48px",
                background: "#F5F8FC",
                borderRadius: "100px",
                border: "1px solid #E0E8F0",
              }}
            >
              <span style={{ fontSize: "32px", fontWeight: 300, color: "#666666" }}>상위</span>
              <span style={{ fontSize: "40px", fontWeight: 700, color: "#0055A8" }}>
                {topPercent !== undefined ? `${topPercent}%` : "-"}
              </span>
            </div>
          );
        case "stats":
          return currentStreak !== undefined && currentStreak > 0 ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "24px 48px",
                background: "#F5F8FC",
                borderRadius: "100px",
                border: "1px solid #E0E8F0",
              }}
            >
              <span style={{ fontSize: "36px" }}>🔥</span>
              <span style={{ fontSize: "32px", fontWeight: 600, color: "#0055A8" }}>
                {currentStreak}일 연속 출석
              </span>
            </div>
          ) : null;
      }
    };

    return (
      <div
        ref={ref}
        style={{
          width: "1080px",
          height: "1920px",
          position: "relative",
          overflow: "hidden",
          fontFamily: "'Pretendard Variable', Pretendard, -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
          backgroundColor: "#FFFFFF",
        }}
      >
        {/* 배경 */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(180deg, #FAFAFA 0%, #FFFFFF 30%, #FFFFFF 70%, #FAFAFA 100%)",
          }}
        />

        {/* 컨텐츠 */}
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            padding: "100px 80px",
            boxSizing: "border-box",
          }}
        >
          {/* 상단 브랜드 */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "80px" }}>
            <div style={{ fontSize: "56px", fontWeight: 900, color: "#1a1a1a", letterSpacing: "-0.02em", marginBottom: "16px" }}>
              PNU Blace
            </div>
            <div style={{ fontSize: "26px", fontWeight: 300, color: "#888888", letterSpacing: "0.15em" }}>
              Bridge + Place
            </div>
          </div>

          {/* 메인 통계 */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: "100px" }}>
            {renderMainContent()}
          </div>

          {/* 하단 정보 */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "36px" }}>
            {renderBadge()}
            <div style={{ fontSize: "24px", fontWeight: 300, color: "#aaaaaa" }}>{dateStr}</div>
            <div style={{ width: "160px", height: "1px", background: "#e0e0e0" }} />
            <div style={{ fontSize: "22px", fontWeight: 600, color: "#cccccc", letterSpacing: "0.1em" }}>PNU Blace</div>
          </div>
        </div>

        {/* 코너 장식 */}
        <CornerDecorations />
      </div>
    );
  }
);

StoryCardTemplate.displayName = "StoryCardTemplate";

// === 서브 컴포넌트 ===

function DashboardContent({ todayHours, weeklyHours, formatHours }: { todayHours: number; weeklyHours: number; formatHours: (h: number) => string }) {
  return (
    <>
      <StatBlock label="TODAY" value={formatHours(todayHours)} unit="hours" subLabel="오늘 공부한 시간" large />
      <Divider />
      <StatBlock label="THIS WEEK" value={formatHours(weeklyHours)} unit="hours" subLabel="이번 주 누적 시간" />
    </>
  );
}

function StatsContent({ totalHours, totalDays, formatHours }: { totalHours: number; totalDays: number; formatHours: (h: number) => string }) {
  return (
    <>
      <StatBlock label="TOTAL" value={formatHours(totalHours)} unit="hours" subLabel="총 공부 시간" large />
      <Divider />
      <StatBlock label="ATTENDANCE" value={String(totalDays)} unit="days" subLabel="총 출석일" />
    </>
  );
}

function RankingContent({ rank, totalUsers, formatNumber }: { rank: number; totalUsers: number; formatNumber: (n: number) => string }) {
  return (
    <>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "22px", fontWeight: 400, color: "#aaaaaa", letterSpacing: "0.4em", textTransform: "uppercase", marginBottom: "24px" }}>
          RANK
        </div>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: "8px" }}>
          <span style={{ fontSize: "60px", fontWeight: 300, color: "#888888" }}>#</span>
          <span style={{ fontSize: "200px", fontWeight: 200, color: "#1a1a1a", lineHeight: 0.9, letterSpacing: "-0.04em" }}>
            {rank}
          </span>
        </div>
        <div style={{ fontSize: "26px", fontWeight: 300, color: "#aaaaaa", marginTop: "24px" }}>
          {formatNumber(totalUsers)}명 중
        </div>
      </div>
    </>
  );
}

function StatBlock({ label, value, unit, subLabel, large = false }: { label: string; value: string; unit: string; subLabel: string; large?: boolean }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: "22px", fontWeight: 400, color: "#aaaaaa", letterSpacing: "0.4em", textTransform: "uppercase", marginBottom: "24px" }}>
        {label}
      </div>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: "12px" }}>
        <span style={{ fontSize: large ? "200px" : "120px", fontWeight: large ? 200 : 300, color: "#1a1a1a", lineHeight: 0.9, letterSpacing: "-0.04em" }}>
          {value}
        </span>
        <span style={{ fontSize: large ? "48px" : "36px", fontWeight: 300, color: "#888888" }}>{unit}</span>
      </div>
      <div style={{ fontSize: "26px", fontWeight: 300, color: "#aaaaaa", marginTop: "24px" }}>{subLabel}</div>
    </div>
  );
}

function Divider() {
  return <div style={{ width: "100px", height: "1px", background: "#e0e0e0", margin: "0 auto" }} />;
}

function CornerDecorations() {
  const cornerStyle = { position: "absolute" as const, width: "40px", height: "40px" };
  return (
    <>
      <div style={{ ...cornerStyle, top: "50px", left: "50px", borderLeft: "1px solid #e0e0e0", borderTop: "1px solid #e0e0e0" }} />
      <div style={{ ...cornerStyle, top: "50px", right: "50px", borderRight: "1px solid #e0e0e0", borderTop: "1px solid #e0e0e0" }} />
      <div style={{ ...cornerStyle, bottom: "50px", left: "50px", borderLeft: "1px solid #e0e0e0", borderBottom: "1px solid #e0e0e0" }} />
      <div style={{ ...cornerStyle, bottom: "50px", right: "50px", borderRight: "1px solid #e0e0e0", borderBottom: "1px solid #e0e0e0" }} />
    </>
  );
}
