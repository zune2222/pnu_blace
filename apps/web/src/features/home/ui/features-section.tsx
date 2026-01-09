"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { BarChart3, Users, Trophy, Monitor } from "lucide-react";

const FEATURES = {
  analytics: {
    title: "이용 통계",
    subtitle: "Analytics",
    description: "자동 기록되는 학습 시간, 주간·월간 리포트로 성장 확인",
    icon: BarChart3,
  },
  study: {
    title: "스터디 그룹",
    subtitle: "Study Groups",
    description: "함께 공부하고 출석 체크",
    icon: Users,
  },
  ranking: {
    title: "랭킹",
    subtitle: "Ranking",
    description: "건강한 경쟁으로 동기 부여",
    icon: Trophy,
  },
  seat: {
    title: "좌석 현황",
    subtitle: "Seat Status",
    description: "실시간 현황 확인",
    icon: Monitor,
  },
} as const;

export const FeaturesSection: React.FC = () => {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section ref={sectionRef} className="py-16 md:py-24 px-6 bg-muted/30">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="text-center mb-12 md:mb-16"
        >
          <p className="text-xs md:text-sm text-muted-foreground/60 font-mono tracking-widest uppercase mb-4">
            Features
          </p>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-light text-foreground leading-tight break-keep">
            학습을 완성하는 도구들
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4"
        >
          {/* 이용 통계 - 2x2 큰 카드 (메인) */}
          <div className="col-span-2 row-span-2 group">
            <div className="h-full min-h-[280px] md:min-h-[320px] p-6 md:p-8 bg-background border border-border rounded-2xl md:rounded-3xl flex flex-col justify-between transition-all duration-300 hover:border-foreground/20">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <FEATURES.analytics.icon className="w-5 h-5 text-muted-foreground/60" />
                  <p className="text-xs text-muted-foreground/50 font-mono uppercase tracking-wider">
                    {FEATURES.analytics.subtitle}
                  </p>
                </div>
                <h3 className="text-2xl md:text-3xl lg:text-4xl font-light text-foreground leading-tight">
                  {FEATURES.analytics.title}
                </h3>
              </div>
              <p className="text-base md:text-lg text-muted-foreground font-light break-keep">
                {FEATURES.analytics.description}
              </p>
            </div>
          </div>

          {/* 스터디 그룹 - 1x1 */}
          <div className="col-span-1 group">
            <div className="h-full min-h-[140px] md:min-h-[152px] p-5 md:p-6 bg-background border border-border rounded-2xl md:rounded-3xl flex flex-col justify-between transition-all duration-300 hover:border-foreground/20">
              <div className="flex items-center gap-2">
                <FEATURES.study.icon className="w-4 h-4 text-muted-foreground/60" />
                <p className="text-xs text-muted-foreground/50 font-mono uppercase tracking-wider">
                  {FEATURES.study.subtitle}
                </p>
              </div>
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

          {/* 랭킹 - 1x1 */}
          <div className="col-span-1 group">
            <div className="h-full min-h-[140px] md:min-h-[152px] p-5 md:p-6 bg-background border border-border rounded-2xl md:rounded-3xl flex flex-col justify-between transition-all duration-300 hover:border-foreground/20">
              <div className="flex items-center gap-2">
                <FEATURES.ranking.icon className="w-4 h-4 text-muted-foreground/60" />
                <p className="text-xs text-muted-foreground/50 font-mono uppercase tracking-wider">
                  {FEATURES.ranking.subtitle}
                </p>
              </div>
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

          {/* 좌석 현황 - 2x1 (부가 기능) */}
          <div className="col-span-2 group">
            <div className="h-full min-h-[140px] md:min-h-[152px] p-5 md:p-6 bg-background border border-border rounded-2xl md:rounded-3xl flex flex-col justify-between transition-all duration-300 hover:border-foreground/20">
              <div className="flex items-center gap-2">
                <FEATURES.seat.icon className="w-4 h-4 text-muted-foreground/60" />
                <p className="text-xs text-muted-foreground/50 font-mono uppercase tracking-wider">
                  {FEATURES.seat.subtitle}
                </p>
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-light text-foreground leading-tight mb-1">
                  {FEATURES.seat.title}
                </h3>
                <p className="text-sm text-muted-foreground/70 font-light break-keep">
                  {FEATURES.seat.description}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
