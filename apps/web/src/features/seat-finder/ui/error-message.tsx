import { ErrorMessageProps } from "@/entities/room";

export const ErrorMessage = ({ message }: ErrorMessageProps) => {
  return (
    <div className="text-center py-12 space-y-4">
      <div className="text-lg text-red-600 dark:text-red-400 font-light">
        열람실 정보를 불러올 수 없습니다
      </div>
      <div className="text-sm text-muted-foreground/60 font-light">
        {message}
      </div>
    </div>
  );
};
