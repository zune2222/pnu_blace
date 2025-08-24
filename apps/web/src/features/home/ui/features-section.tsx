import React from "react";

const features = [
  {
    number: "01",
    title: "실시간",
    subtitle: "Real-time Monitoring",
    description:
      "도서관 좌석 현황을 실시간으로 모니터링하여 좌석을 예약할 수 있어요",
    status: "available",
  },
  {
    number: "02",
    title: "이용 요약",
    subtitle: "Usage Analytics",
    description: "도서관에서 시간을 얼마나 보냈는지 요약해드려요.",
    status: "available",
  },
  {
    number: "03",
    title: "자리 예측",
    subtitle: "Seat Prediction",
    description: "예측 알고리즘을 통해 원하는 좌석이 언제 비는지 알 수 있어요.",
    status: "coming-soon",
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
              <p className="text-lg md:text-xl text-muted-foreground font-light leading-relaxed max-w-3xl mx-auto">
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
