import { CountdownTimer } from "@/components/countdown-timer";
import { HomePageClient } from "./home-page-client";

async function getPledgesData() {
  try {
    // Get pledges data from Redis API
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000";

    const response = await fetch(`${baseUrl}/api/pledges`, {
      cache: "no-store", // Ensure we get fresh data from Redis
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching pledges data from Redis:", error);
    // Fallback to empty data
    return {
      pledges: [],
      startDate: Date.now() - 604800000, // 7 days ago
      lastUpdated: Date.now(),
    };
  }
}

export default async function HomePage() {
  const data = await getPledgesData();

  // Type guard to ensure data has the expected structure
  const pledgesData = data as {
    pledges: Array<{
      room: "bathroom" | "kitchen" | "lounge";
      amount: number;
      name: string;
      email: string;
    }>;
  };

  // Process room totals
  const roomTotals = pledgesData.pledges.reduce(
    (
      acc: Record<"bathroom" | "kitchen" | "lounge", number>,
      pledge: { room: "bathroom" | "kitchen" | "lounge"; amount: number }
    ) => {
      acc[pledge.room] = (acc[pledge.room] || 0) + pledge.amount;
      return acc;
    },
    { bathroom: 0, kitchen: 0, lounge: 0 }
  );

  // Process person totals
  const personTotalsMap = new Map<string, { total: number; email: string }>();
  pledgesData.pledges.forEach(
    (pledge: { name: string; amount: number; email: string }) => {
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
    }
  );

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

        {/* Room Cards and Stats */}
        <HomePageClient roomTotals={roomTotals} personTotals={personTotals} />
      </div>
    </div>
  );
}
