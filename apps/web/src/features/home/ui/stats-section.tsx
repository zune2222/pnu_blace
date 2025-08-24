import React from "react";

const stats = [
  { value: "99.9%", label: "서비스 가동률" },
  { value: "24/7", label: "실시간 모니터링" },
];

export const StatsSection: React.FC = () => {
  return (
    <section className="py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-2 gap-16 text-center">
          {stats.map((stat, index) => (
            <div key={index}>
              <div className="text-4xl md:text-5xl lg:text-6xl font-light text-primary variable-weight-hover mb-4 cursor-default">
                {stat.value}
              </div>
              <div className="text-muted-foreground text-lg font-light">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
