import React from "react";

const FEATURES = {
  seat: {
    title: "실시간 좌석",
    subtitle: "Seat Monitoring",
    description: "층별·열람실별 현황을 한눈에",
  },
  analytics: {
    title: "이용 통계",
    subtitle: "Analytics",
    description: "자동 기록되는 학습 시간",
  },
  study: {
    title: "스터디 그룹",
    subtitle: "Study Groups",
    description: "함께 공부하고 출석 체크",
  },
  ranking: {
    title: "랭킹",
    subtitle: "Ranking",
    description: "건강한 경쟁으로 동기 부여",
  },
} as const;

export const FeaturesSection: React.FC = () => {
  return (
    <section className="py-16 md:py-24 px-6 bg-muted/30">
      <div className="max-w-5xl mx-auto">
        {/* 섹션 헤더 */}
        <div className="text-center mb-12 md:mb-16">
          <p className="text-xs md:text-sm text-muted-foreground/60 font-mono tracking-widest uppercase mb-4">
            Features
          </p>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-light text-foreground leading-tight break-keep">
            기존 앱의 빈틈을 채우는 기능들
          </h2>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {/* 실시간 좌석 - 2x2 큰 카드 */}
          <div className="col-span-2 row-span-2 group">
            <div className="h-full min-h-[280px] md:min-h-[320px] p-6 md:p-8 bg-background border border-border rounded-2xl md:rounded-3xl flex flex-col justify-between transition-all duration-300 hover:border-foreground/20">
              <div>
                <p className="text-xs text-muted-foreground/50 font-mono uppercase tracking-wider mb-2">
                  {FEATURES.seat.subtitle}
                </p>
                <h3 className="text-2xl md:text-3xl lg:text-4xl font-light text-foreground leading-tight">
                  {FEATURES.seat.title}
                </h3>
              </div>
              <p className="text-base md:text-lg text-muted-foreground font-light break-keep">
                {FEATURES.seat.description}
              </p>
            </div>
          </div>

          {/* 이용 통계 - 1x1 */}
          <div className="col-span-1 group">
            <div className="h-full min-h-[140px] md:min-h-[152px] p-5 md:p-6 bg-background border border-border rounded-2xl md:rounded-3xl flex flex-col justify-between transition-all duration-300 hover:border-foreground/20">
              <p className="text-xs text-muted-foreground/50 font-mono uppercase tracking-wider">
                {FEATURES.analytics.subtitle}
              </p>
              <div>
                <h3 className="text-lg md:text-xl font-light text-foreground leading-tight mb-1">
                  {FEATURES.analytics.title}
                </h3>
                <p className="text-sm text-muted-foreground/70 font-light break-keep">
                  {FEATURES.analytics.description}
                </p>
              </div>
            </div>
          </div>

          {/* 스터디 그룹 - 1x1 */}
          <div className="col-span-1 group">
            <div className="h-full min-h-[140px] md:min-h-[152px] p-5 md:p-6 bg-background border border-border rounded-2xl md:rounded-3xl flex flex-col justify-between transition-all duration-300 hover:border-foreground/20">
              <p className="text-xs text-muted-foreground/50 font-mono uppercase tracking-wider">
                {FEATURES.study.subtitle}
              </p>
              <div>
                <h3 className="text-lg md:text-xl font-light text-foreground leading-tight mb-1">
                  {FEATURES.study.title}
                </h3>
                <p className="text-sm text-muted-foreground/70 font-light break-keep">
                  {FEATURES.study.description}
                </p>
              </div>
            </div>
          </div>

          {/* 랭킹 - 2x1 와이드 카드 */}
          <div className="col-span-2 group">
            <div className="h-full min-h-[140px] md:min-h-[152px] p-5 md:p-6 bg-background border border-border rounded-2xl md:rounded-3xl flex flex-col justify-between transition-all duration-300 hover:border-foreground/20">
              <p className="text-xs text-muted-foreground/50 font-mono uppercase tracking-wider">
                {FEATURES.ranking.subtitle}
              </p>
              <div>
                <h3 className="text-lg md:text-xl font-light text-foreground leading-tight mb-1">
                  {FEATURES.ranking.title}
                </h3>
                <p className="text-sm text-muted-foreground/70 font-light break-keep">
                  {FEATURES.ranking.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
