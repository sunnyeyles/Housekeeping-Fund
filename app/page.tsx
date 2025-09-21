import { StatsSection } from "@/components/stats-section";
import { CountdownTimer } from "@/components/countdown-timer";
import { HomePageClient } from "./home-page-client";

async function getPledgesData() {
  try {
    // Try to fetch from our API endpoint first (which handles the blob storage internally)
    const response = await fetch("http://localhost:3000/api/pledges", {
      cache: "no-store",
    });

    if (response.ok) {
      const data = await response.json();
      return data;
    }
  } catch (error) {
    console.error("Error fetching pledges data:", error);
  }

  // Fallback to empty data if API fails
  return { pledges: [], startDate: Date.now() };
}

export default async function HomePage() {
  const data = await getPledgesData();

  // Process room totals
  const roomTotals = data.pledges.reduce(
    (acc: Record<"bathroom" | "kitchen" | "lounge", number>, pledge: any) => {
      acc[pledge.room] = (acc[pledge.room] || 0) + pledge.amount; // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      return acc;
    },
    { bathroom: 0, kitchen: 0, lounge: 0 }
  );

  // Process person totals
  const personTotalsMap = new Map<string, { total: number; email: string }>();
  data.pledges.forEach((pledge: any) => {
    const key = pledge.name.toLowerCase();
    const existing = personTotalsMap.get(key);
    if (existing) {
      existing.total += pledge.amount;
      existing.email = pledge.email;
    } else {
      personTotalsMap.set(key, {
        total: pledge.amount,
        email: pledge.email,
      });
    }
  });

  const personTotals = Array.from(personTotalsMap.entries())
    .map(([name, data]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      total: data.total,
      email: data.email,
    }))
    .sort((a, b) => b.total - a.total);

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-6 py-12">
        {/* Header - Brutalist style */}
        <div className="text-center mb-8 md:mb-16">
          <div className="brutal-border bg-black p-4 md:p-8 mb-6 md:mb-8">
            <h1 className="text-3xl md:text-6xl font-black text-white mb-4 md:mb-6 uppercase tracking-widest">
              Housekeeping Fund
            </h1>
            <p className="text-lg md:text-2xl font-bold text-white uppercase tracking-wide max-w-4xl mx-auto leading-relaxed">
              Keep the cockroaches out of the house!
            </p>
          </div>
        </div>

        <div className="mb-12">
          <CountdownTimer />
        </div>

        {/* Stats Section */}
        <div className="mb-16">
          <StatsSection roomTotals={roomTotals} personTotals={personTotals} />
        </div>

        {/* Room Cards */}
        <HomePageClient roomTotals={roomTotals} />
      </div>
    </div>
  );
}
