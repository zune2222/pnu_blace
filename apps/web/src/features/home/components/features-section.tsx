import React from "react";

const features = [
  {
    title: "실시간",
    description:
      "도서관 좌석 현황을 실시간으로 모니터링하여 빈 좌석을 즉시 확인할 수 있습니다",
  },
  {
    title: "자동 예약",
    description:
      "원하는 좌석이 비면 자동으로 예약해드려서 수동으로 확인할 필요가 없습니다",
  },
  {
    title: "스마트 알림",
    description:
      "예약 완료, 좌석 변경 등 중요한 정보를 실시간으로 알림받을 수 있습니다",
  },
];

export const FeaturesSection: React.FC = () => {
  return (
    <section className="py-32 px-6">
      <div className="max-w-5xl mx-auto space-y-32">
        {features.map((feature, index) => (
          <div key={index} className="text-center">
            <h2 className="text-6xl md:text-7xl lg:text-8xl font-light text-foreground variable-weight-hover mb-8 cursor-default">
              {feature.title}
            </h2>
            <p className="text-xl md:text-2xl text-muted-foreground font-light leading-relaxed max-w-3xl mx-auto">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};
