import { useState, useEffect } from 'react';

interface CountdownTime {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

export const useCountdown = (targetDate: Date): CountdownTime => {
  const [timeLeft, setTimeLeft] = useState<CountdownTime>({
    days: 0,
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
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({
          days,
          hours,
          minutes,
          seconds,
          total: difference
        });
      } else {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          total: 0
        });
      }
    };

    // Calculer immédiatement une fois
    calculateTimeLeft();

    // Mettre à jour toutes les secondes
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  return timeLeft;
};

export const formatCountdown = (time: CountdownTime): string => {
  if (time.total <= 0) {
    return 'Vous pouvez maintenant relever le défi !';
  }

  if (time.days > 0) {
    return `Dans ${time.days} jour${time.days > 1 ? 's' : ''} et ${time.hours} heure${time.hours > 1 ? 's' : ''}`;
  } else if (time.hours > 0) {
    return `Dans ${time.hours} heure${time.hours > 1 ? 's' : ''} et ${time.minutes} minute${time.minutes > 1 ? 's' : ''}`;
  } else if (time.minutes > 0) {
    return `Dans ${time.minutes} minute${time.minutes > 1 ? 's' : ''} et ${time.seconds} seconde${time.seconds > 1 ? 's' : ''}`;
  } else {
    return `Dans ${time.seconds} seconde${time.seconds > 1 ? 's' : ''}`;
  }
};