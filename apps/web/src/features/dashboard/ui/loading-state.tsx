import React from "react";

export const LoadingState: React.FC = () => {
  return (
    <section className="py-20 md:py-32">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="animate-pulse space-y-6">
          {/* 좌석 정보 스켈레톤 */}
          <div className="text-center space-y-4">
            <div className="bg-muted/20 rounded-lg h-8 w-32 mx-auto"></div>
            <div className="bg-muted/20 rounded-lg h-12 w-64 mx-auto"></div>
            <div className="bg-muted/20 rounded-lg h-6 w-48 mx-auto"></div>
          </div>
          
          {/* 액션 버튼들 스켈레톤 */}
          <div className="flex justify-center gap-4">
            <div className="bg-muted/20 rounded-lg h-12 w-24"></div>
            <div className="bg-muted/20 rounded-lg h-12 w-24"></div>
          </div>
        </div>
      </div>
    </section>
  );
};