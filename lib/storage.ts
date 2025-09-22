export interface Pledge {
  id: string;
  name: string;
  amount: number;
  room: "bathroom" | "kitchen" | "lounge";
  email: string;
  timestamp: number;
}

export interface PledgeData {
  pledges: Pledge[];
  startDate: number;
  lastUpdated?: number;
}

// Empty pledges data structure (fallback when API is not available)
const emptyPledgesData: PledgeData = {
  pledges: [],
  startDate: Date.now() - 604800000, // 7 days ago
  lastUpdated: Date.now(),
};

// No longer needed since we're using localStorage directly

// Normalize name: trim, lowercase, then capitalize first letter
export function normalizeName(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "";
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
}

// Fetch pledges data from Redis API
async function fetchPledgesData(): Promise<PledgeData> {
  try {
    console.log("Fetching pledges from Redis API");

    const response = await fetch("/api/pledges");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Successfully fetched pledges from Redis API:", data);
    return data;
  } catch (error) {
    console.error("Error fetching pledges data from Redis API:", error);
    console.log("Returning empty pledges data due to error");
    return emptyPledgesData;
  }
}

// Save pledges data to Redis API
async function savePledgesData(data: PledgeData): Promise<boolean> {
  try {
    const pledgeData: PledgeData = {
      ...data,
      lastUpdated: Date.now(),
    };

    console.log("Saving pledges data to Redis API:", pledgeData);

    // This function is no longer used since addPledge calls the API directly
    // Keeping for backward compatibility but it won't be called
    console.log("savePledgesData is deprecated - use addPledge instead");

    return true;
  } catch (error) {
    console.error("Error saving pledges data:", error);
    return false;
  }
}

// Public API functions
export async function loadPledges(): Promise<PledgeData> {
  if (typeof window === "undefined") {
    return emptyPledgesData;
  }

  return await fetchPledgesData();
}

export async function savePledges(data: PledgeData): Promise<boolean> {
  if (typeof window === "undefined") return false;

  return await savePledgesData(data);
}

export async function addPledge(
  name: string,
  amount: number,
  room: Pledge["room"],
  email: string
): Promise<boolean> {
  try {
    console.log("Adding pledge via Redis API:", { name, amount, room, email });

    const response = await fetch("/api/pledges/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        amount,
        room,
        email,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Redis API error:", errorData);
      return false;
    }

    const result = await response.json();
    console.log("Pledge added successfully to Redis:", result);
    return true;
  } catch (error) {
    console.error("Error adding pledge to Redis:", error);
    return false;
  }
}

export async function getPledgesByRoom(): Promise<
  Record<Pledge["room"], number>
> {
  const data = await loadPledges();
  return data.pledges.reduce(
    (acc, pledge) => {
      acc[pledge.room] = (acc[pledge.room] || 0) + pledge.amount;
      return acc;
    },
    { bathroom: 0, kitchen: 0, lounge: 0 } as Record<Pledge["room"], number>
  );
}

export async function getPledgesByPerson(): Promise<
  Array<{
    name: string;
    total: number;
    email: string;
  }>
> {
  const data = await loadPledges();
  const personTotals = new Map<string, { total: number; email: string }>();

  data.pledges.forEach((pledge) => {
    const key = pledge.name.toLowerCase();
    const existing = personTotals.get(key);
    if (existing) {
      existing.total += pledge.amount;
      // Keep the most recent email
      existing.email = pledge.email;
    } else {
      personTotals.set(key, {
        total: pledge.amount,
        email: pledge.email,
      });
    }
  });

  return Array.from(personTotals.entries())
    .map(([name, data]) => ({
      name: normalizeName(name),
      total: data.total,
      email: data.email,
    }))
    .sort((a, b) => b.total - a.total);
}

export async function getStartDate(): Promise<number> {
  const data = await loadPledges();
  return data.startDate;
}
