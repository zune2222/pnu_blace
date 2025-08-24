import React from "react";

const features = [
  {
    title: "실시간",
    description:
      "도서관 좌석 현황을 실시간으로 모니터링하여 좌석을 예약할 수 있어요",
  },
  {
    title: "이용 요약",
    description: "도서관에서 시간을 얼마나 보냈는지 요약해드려요.",
  },
  {
    title: "자리 예측",
    description:
      "예측 알고리즘을 통해 원하는 좌석이 언제 비는지 알 수 있어요. (예정)",
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
