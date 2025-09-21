"use client";

import { useState, useEffect } from "react";
import { getStartDate } from "@/lib/storage";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const startDate = getStartDate();
      const endDate = startDate + 14 * 24 * 60 * 60 * 1000; // 2 weeks from start
      const now = Date.now();
      const difference = endDate - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor(
          (difference % (1000 * 60 * 60)) / (1000 * 60)
        );
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
        setIsExpired(false);
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        setIsExpired(true);
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="brutal-card p-4 md:p-8">
      <div className="text-center">
        <h3 className="text-lg md:text-2xl font-black text-black mb-4 md:mb-8 uppercase tracking-widest">
          {isExpired ? "Pledge Period Ended" : "Time Remaining until cleaner"}
        </h3>

        {isExpired ? (
          <div className="brutal-border bg-black p-4 md:p-6">
            <div className="text-xl md:text-3xl font-black text-white uppercase tracking-widest">
              Pledging has ended
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
            <div className="brutal-border bg-white p-3 md:p-4 text-center">
              <div className="text-2xl md:text-4xl font-black text-black">
                {timeLeft.days}
              </div>
              <div className="text-xs md:text-sm font-bold text-black uppercase tracking-widest">
                Days
              </div>
            </div>
            <div className="brutal-border bg-white p-3 md:p-4 text-center">
              <div className="text-2xl md:text-4xl font-black text-black">
                {timeLeft.hours}
              </div>
              <div className="text-xs md:text-sm font-bold text-black uppercase tracking-widest">
                Hours
              </div>
            </div>
            <div className="brutal-border bg-white p-3 md:p-4 text-center">
              <div className="text-2xl md:text-4xl font-black text-black">
                {timeLeft.minutes}
              </div>
              <div className="text-xs md:text-sm font-bold text-black uppercase tracking-widest">
                Minutes
              </div>
            </div>
            <div className="brutal-border bg-white p-3 md:p-4 text-center">
              <div className="text-2xl md:text-4xl font-black text-black">
                {timeLeft.seconds}
              </div>
              <div className="text-xs md:text-sm font-bold text-black uppercase tracking-widest">
                Seconds
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
