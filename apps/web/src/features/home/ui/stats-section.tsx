import React from "react";

const features = [
  {
    title: "실시간 모니터링",
    description: "도서관 좌석 현황을 실시간으로 확인할 수 있습니다",
  },
  {
    title: "스마트 알림",
    description: "원하는 좌석이 비면 즉시 알려드립니다",
  },
];

export const StatsSection: React.FC = () => {
  return (
    <section className="section-padding">
      <div className="max-w-5xl mx-auto px-6">
        {/* 섹션 헤더 */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-light text-foreground mb-6">
            왜 PNU Blace인가요?
          </h2>
          <p className="text-xl text-muted-foreground font-light max-w-2xl mx-auto">
            부산대학교 학생들을 위한 스마트한 도서관 경험
          </p>
        </div>

        {/* 기능 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">
          {features.map((feature, index) => (
            <div key={index} className="text-center space-y-4">
              <h3 className="text-2xl md:text-3xl font-medium text-foreground">
                {feature.title}
              </h3>
              <p className="text-lg text-muted-foreground font-light leading-relaxed break-keep">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* 하단 메시지 */}
        <div className="text-center mt-16">
          <p className="text-lg text-muted-foreground font-light max-w-3xl mx-auto break-keep">
            복잡한 도서관 좌석 예약 시스템을 간단하고 직관적으로 만들어
            <br className="hidden sm:block" />
            <span className="sm:hidden"> </span>
            여러분의 학습에만 집중할 수 있도록 도와드립니다
          </p>
        </div>
      </div>
    </section>
  );
};
