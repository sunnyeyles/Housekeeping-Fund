"use client";

interface StatsSectionProps {
  roomTotals: Record<"bathroom" | "kitchen" | "lounge", number>;
  personTotals: Array<{ name: string; total: number; email: string }>;
}

import { TOTAL_TARGET } from "@/lib/config";

export function StatsSection({ roomTotals, personTotals }: StatsSectionProps) {
  const totalPledged = Object.values(roomTotals).reduce(
    (sum, amount) => sum + amount,
    0
  );
  const target = TOTAL_TARGET;
  const progressPercentage = Math.min((totalPledged / target) * 100, 100);

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Total pledged - brutalist style */}
      <div className="brutal-card p-4 md:p-8 text-center">
        <div className="text-4xl md:text-6xl font-black text-black mb-2 md:mb-4 tracking-widest">
          ${totalPledged.toFixed(2)} / ${target}
        </div>

        {/* Progress bar */}
        <div className="brutal-border bg-white p-2">
          <div className="w-full bg-gray-200 h-6 relative">
            <div
              className="bg-black h-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            ></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-black text-white uppercase tracking-widest">
                {progressPercentage.toFixed(0)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        {/* Room breakdown - brutalist style */}
        <div className="brutal-card p-4 md:p-8">
          <h3 className="text-xl md:text-2xl font-black mb-4 md:mb-6 text-black uppercase tracking-widest">
            Amount contributed by room
          </h3>
          <div className="space-y-3 md:space-y-4">
            {Object.entries(roomTotals).map(([room, amount]) => (
              <div
                key={room}
                className="brutal-border bg-white p-3 md:p-4 flex justify-between items-center"
              >
                <span className="text-sm md:text-lg font-bold text-black uppercase tracking-wide">
                  {room === "lounge" ? "Lounge Room" : room}
                </span>
                <div className="text-lg md:text-2xl font-black text-black">
                  ${amount.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Person breakdown - brutalist style */}
        <div className="brutal-card p-4 md:p-8">
          <h3 className="text-xl md:text-2xl font-black mb-4 md:mb-6 text-black uppercase tracking-widest">
            Top Contributors
          </h3>
          <div className="space-y-3 md:space-y-4">
            {personTotals.length === 0 ? (
              <div className="brutal-border bg-white p-4 md:p-6 text-center">
                <div className="text-sm md:text-lg font-bold text-black uppercase tracking-wide">
                  No pledges yet. Be the first to contribute!
                </div>
              </div>
            ) : (
              personTotals.slice(0, 5).map((person, index) => (
                <div
                  key={`${person.name}-${index}`}
                  className="brutal-border bg-white p-3 md:p-4 flex justify-between items-center"
                >
                  <div className="flex items-center gap-2 md:gap-3">
                    <span className="text-sm md:text-lg font-bold text-black uppercase tracking-wide">
                      {person.name}
                    </span>
                    {index === 0 && (
                      <div className="brutal-border bg-black text-white px-1 py-0.5 md:px-2 md:py-1 text-xs font-black uppercase tracking-widest">
                        Top
                      </div>
                    )}
                  </div>
                  <div className="text-lg md:text-xl font-black text-black">
                    ${person.total.toFixed(2)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
