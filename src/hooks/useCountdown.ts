import { useState, useEffect } from 'react';

interface CountdownTime {
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

export const useCountdown = (targetDate: Date): CountdownTime => {
  const [timeLeft, setTimeLeft] = useState<CountdownTime>({
    hours: 0,
    minutes: 0,
    seconds: 0,
    total: 0
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const target = targetDate.getTime();
      const difference = target - now;

      if (difference > 0) {
        const hours = Math.floor(difference / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({
          hours,
          minutes,
          seconds,
          total: difference
        });
      } else {
        setTimeLeft({
          hours: 0,
          minutes: 0,
          seconds: 0,
          total: 0
        });
      }
    };

    // 立即计算一次
    calculateTimeLeft();

    // 每秒更新一次
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  return timeLeft;
};

export const formatCountdown = (time: CountdownTime): string => {
  if (time.total <= 0) {
    return '现在可以挑战了！';
  }

  if (time.hours > 0) {
    return `${time.hours}小时${time.minutes}分钟后`;
  } else if (time.minutes > 0) {
    return `${time.minutes}分钟${time.seconds}秒后`;
  } else {
    return `${time.seconds}秒后`;
  }
}; 