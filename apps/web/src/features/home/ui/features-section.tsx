import React from "react";

const features = [
  {
    number: "01",
    title: "실시간 좌석 조회",
    subtitle: "Real-time Seat Monitoring",
    description:
      "도서관 좌석 현황을 실시간으로 확인하고 원하는 좌석을 발권할 수 있어요",
    status: "available",
  },
  {
    number: "02",
    title: "이용 통계",
    subtitle: "Usage Analytics",
    description: "도서관 이용 시간과 패턴을 분석하여 개인 맞춤 통계를 제공해드려요",
    status: "available",
  },
  {
    number: "03",
    title: "스터디 그룹",
    subtitle: "Study Groups",
    description: "함께 공부할 동료들과 그룹을 만들어 출석체크와 진도관리를 해보세요",
    status: "available",
  },
  {
    number: "04",
    title: "랭킹 시스템",
    subtitle: "Ranking System",
    description: "이용 시간과 출석일수를 기반으로 한 랭킹으로 학습 동기를 얻어보세요",
    status: "available",
  },
];

export const FeaturesSection: React.FC = () => {
  return (
    <section className="py-16 md:py-24 px-6">
      <div className="max-w-5xl mx-auto">
        {/* 섹션 헤더 */}
        <div className="text-center mb-16 md:mb-20">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-light text-foreground mb-6 leading-tight">
            핵심 기능
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground font-light max-w-2xl mx-auto">
            스마트한 도서관 경험을 위한 기능들
          </p>
        </div>

        {/* 기능 목록 */}
        <div className="space-y-16 md:space-y-20">
          {features.map((feature, index) => (
            <div key={index} className="text-center space-y-6">
              {/* 번호와 상태 */}
              <div className="flex items-center justify-center space-x-4 mb-4">
                <span className="text-sm font-mono text-muted-foreground/60 tracking-wider">
                  {feature.number}
                </span>
                {feature.status === "coming-soon" && (
                  <span className="text-xs px-3 py-1 bg-muted text-muted-foreground rounded-full font-medium">
                    출시 예정
                  </span>
                )}
              </div>

              {/* 제목 */}
              <h3 className="text-4xl md:text-5xl lg:text-6xl font-light text-foreground leading-tight">
                {feature.title}
              </h3>

              {/* 영문 부제목 */}
              <p className="text-base md:text-lg text-muted-foreground/70 font-light italic">
                {feature.subtitle}
              </p>

              {/* 설명 */}
              <p className="text-lg md:text-xl text-muted-foreground font-light leading-relaxed max-w-3xl mx-auto break-keep">
                {feature.description}
              </p>

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
