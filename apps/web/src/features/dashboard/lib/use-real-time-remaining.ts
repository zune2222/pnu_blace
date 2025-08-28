import { useState, useEffect } from "react";

interface UseRealTimeRemainingProps {
  endTime?: string;
  initialRemainingMinutes?: number;
}

export const useRealTimeRemaining = ({
  endTime,
  initialRemainingMinutes = 0,
}: UseRealTimeRemainingProps) => {
  const [remainingMinutes, setRemainingMinutes] = useState(initialRemainingMinutes);
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  useEffect(() => {
    if (!endTime) {
      setRemainingMinutes(0);
      setRemainingSeconds(0);
      return;
    }

    const calculateRemaining = () => {
      const now = new Date();
      let targetEndTime: Date;

      // endTime이 "HH:MM" 형식인 경우 오늘 날짜와 결합
      if (endTime.includes(':') && !endTime.includes(' ')) {
        const today = new Date();
        targetEndTime = new Date(`${today.toDateString()} ${endTime}`);
        
        // 만약 계산된 시간이 현재보다 과거라면, 다음 날로 설정
        if (targetEndTime <= now) {
          targetEndTime.setDate(targetEndTime.getDate() + 1);
        }
      } else {
        // ISO 형식이나 다른 형식의 경우
        targetEndTime = new Date(endTime);
      }

      const diffMs = targetEndTime.getTime() - now.getTime();
      const totalSeconds = Math.max(0, Math.floor(diffMs / 1000));
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      
      return { minutes, seconds, totalSeconds };
    };

    // 초기 계산
    const initial = calculateRemaining();
    setRemainingMinutes(initial.minutes);
    setRemainingSeconds(initial.seconds);

    // 매초마다 업데이트
    const interval = setInterval(() => {
      const newRemaining = calculateRemaining();
      setRemainingMinutes(newRemaining.minutes);
      setRemainingSeconds(newRemaining.seconds);

      // 시간이 다 된 경우 인터벌 정리
      if (newRemaining.totalSeconds <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [endTime, initialRemainingMinutes]);

  return { remainingMinutes, remainingSeconds };
};