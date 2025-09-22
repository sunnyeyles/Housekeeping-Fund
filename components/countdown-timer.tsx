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
  const [endDate, setEndDate] = useState<number | null>(null);

  useEffect(() => {
    // Calculate next Saturday at 12pm
    const getNextSaturday12PM = () => {
      const now = new Date();
      const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
      const daysUntilSaturday = (6 - currentDay) % 7; // Days until next Saturday (0 if today is Saturday)

      // If it's Saturday and before 12pm, use today; otherwise use next Saturday
      const isTodaySaturday = currentDay === 6;
      const isBefore12PM = now.getHours() < 12;

      let targetDate;
      if (isTodaySaturday && isBefore12PM) {
        // Today is Saturday and it's before 12pm, use today
        targetDate = new Date(now);
      } else {
        // Use next Saturday
        targetDate = new Date(now);
        targetDate.setDate(
          now.getDate() + (daysUntilSaturday === 0 ? 7 : daysUntilSaturday)
        );
      }

      // Set time to 12:00:00 PM
      targetDate.setHours(12, 0, 0, 0);

      return targetDate.getTime();
    };

    const calculatedEndDate = getNextSaturday12PM();
    setEndDate(calculatedEndDate);
  }, []);

  useEffect(() => {
    // Only run the timer if we have an end date
    if (endDate === null) return;

    const calculateTimeLeft = () => {
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

    // Calculate immediately
    calculateTimeLeft();

    // Then update every second
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [endDate]);

  return (
    <div className="brutal-card p-4 md:p-8">
      <div className="text-center">
        <h3 className="text-lg md:text-2xl font-black text-black mb-4 md:mb-8 uppercase tracking-widest">
          {isExpired
            ? "Pledge Period Ended"
            : "Time Remaining until cleaner arrives"}
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
