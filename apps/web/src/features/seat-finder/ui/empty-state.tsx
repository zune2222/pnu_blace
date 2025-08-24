export const EmptyState = () => {
  return (
    <div className="text-center py-12 space-y-6">
      <div className="space-y-4">
        <h3 className="text-xl md:text-2xl font-light text-foreground">
          현재 이용 가능한 열람실이 없습니다
        </h3>
        <p className="text-base md:text-lg text-muted-foreground font-light leading-relaxed max-w-md mx-auto">
          잠시 후 다시 시도해보세요
        </p>
      </div>
    </div>
  );
};
