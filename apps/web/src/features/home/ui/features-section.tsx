import React from "react";

const features = [
  {
    number: "01",
    title: "실시간 좌석 조회",
    subtitle: "Real-time Seat Monitoring",
    description:
      "층별, 열람실별 좌석 현황을 한눈에 파악하세요. 더 이상 자리를 찾아 헤매지 않아도 됩니다.",
    highlights: ["전체 열람실 통합 조회", "모바일 최적화 UI", "빠른 좌석 발권"],
    status: "available",
  },
  {
    number: "02",
    title: "이용 통계",
    subtitle: "Usage Analytics",
    description:
      "도서관 이용 시간이 자동으로 기록됩니다. 일별, 주별, 월별 패턴을 분석해 학습 습관을 개선하세요.",
    highlights: ["자동 시간 기록", "시각화된 통계", "목표 달성률 확인"],
    status: "available",
  },
  {
    number: "03",
    title: "스터디 그룹",
    subtitle: "Study Groups",
    description:
      "함께 공부하는 동료들과 그룹을 만들어보세요. 서로의 출석을 확인하고 함께 성장할 수 있습니다.",
    highlights: ["그룹 출석 체크", "실시간 멤버 현황", "학습 동기 부여"],
    status: "available",
  },
  {
    number: "04",
    title: "랭킹 시스템",
    subtitle: "Ranking System",
    description:
      "이용 시간과 출석 일수를 기반으로 순위를 확인하세요. 건강한 경쟁으로 학습 동기를 높여보세요.",
    highlights: ["전체/학과별 랭킹", "주간/월간 순위", "성취 배지 시스템"],
    status: "available",
  },
];

export const FeaturesSection: React.FC = () => {
  return (
    <section className="py-20 md:py-32 px-6 bg-muted/30">
      <div className="max-w-5xl mx-auto">
        {/* 섹션 헤더 */}
        <div className="text-center mb-16 md:mb-24">
          <p className="text-sm md:text-base text-muted-foreground/70 font-mono tracking-widest uppercase mb-6">
            Core Features
          </p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-light text-foreground mb-6 leading-tight">
            더 나은 도서관 경험을 위한
            <br />
            핵심 기능
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground font-light max-w-2xl mx-auto break-keep">
            기존 앱에서 불편했던 부분들을 개선하고,
            <br className="hidden sm:block" />
            <span className="sm:hidden"> </span>
            새로운 가치를 더했습니다.
          </p>
        </div>

        {/* 기능 목록 */}
        <div className="space-y-20 md:space-y-28">
          {features.map((feature, index) => (
            <div key={index} className="space-y-8">
              {/* 상단: 번호와 제목 */}
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center space-x-4">
                  <span className="text-sm font-mono text-muted-foreground/60 tracking-wider">
                    {feature.number}
                  </span>
                  {feature.status === "coming-soon" && (
                    <span className="text-xs px-3 py-1 bg-muted text-muted-foreground rounded-full font-medium">
                      출시 예정
                    </span>
                  )}
                </div>

                <h3 className="text-4xl md:text-5xl lg:text-6xl font-light text-foreground leading-tight">
                  {feature.title}
                </h3>

                <p className="text-base md:text-lg text-muted-foreground/70 font-light italic">
                  {feature.subtitle}
                </p>
              </div>

              {/* 설명 */}
              <p className="text-lg md:text-xl text-muted-foreground font-light leading-relaxed max-w-3xl mx-auto text-center break-keep">
                {feature.description}
              </p>

              {/* 하이라이트 태그 */}
              <div className="flex flex-wrap justify-center gap-3">
                {feature.highlights.map((highlight, hIndex) => (
                  <span
                    key={hIndex}
                    className="text-sm px-4 py-2 bg-background border border-border rounded-full text-muted-foreground font-light"
                  >
                    {highlight}
                  </span>
                ))}
              </div>

              {/* 구분선 (마지막 아이템 제외) */}
              {index < features.length - 1 && (
                <div className="pt-8">
                  <div className="w-24 h-px bg-muted-foreground/20 mx-auto"></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
