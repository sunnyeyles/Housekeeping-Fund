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

const API_BASE_URL = "/api/pledges";

// Normalize name: trim, lowercase, then capitalize first letter
export function normalizeName(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "";
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
}

export async function loadPledges(): Promise<PledgeData> {
  if (typeof window === "undefined") {
    return { pledges: [], startDate: Date.now() };
  }

  try {
    console.log("Loading pledges from API:", API_BASE_URL);
    const response = await fetch(API_BASE_URL);
    console.log("API response status:", response.status, response.ok);

    if (response.ok) {
      const data = await response.json();
      console.log("API response data:", data);
      return data;
    } else {
      console.error(
        "API response not ok:",
        response.status,
        response.statusText
      );
    }
  } catch (error) {
    console.error("Error loading pledges:", error);
  }

  // Return empty data if fetch fails
  console.log("Returning empty pledges data");
  return { pledges: [], startDate: Date.now() };
}

export async function savePledges(data: PledgeData): Promise<boolean> {
  if (typeof window === "undefined") return false;

  try {
    const response = await fetch(API_BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      console.log("Pledges saved successfully:", data);
      return true;
    } else {
      console.error("Failed to save pledges:", response.statusText);
      return false;
    }
  } catch (error) {
    console.error("Error saving pledges:", error);
    return false;
  }
}

export async function addPledge(
  name: string,
  amount: number,
  room: Pledge["room"],
  email: string
): Promise<boolean> {
  const data = await loadPledges();
  const normalizedName = normalizeName(name);

  // Find existing pledge from same person for same room and update, or create new
  const existingIndex = data.pledges.findIndex(
    (p) =>
      p.name.toLowerCase() === normalizedName.toLowerCase() && p.room === room
  );

  if (existingIndex >= 0) {
    // Update existing pledge
    data.pledges[existingIndex].amount += amount;
    data.pledges[existingIndex].email = email;
    data.pledges[existingIndex].timestamp = Date.now();
  } else {
    // Create new pledge
    const newPledge: Pledge = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: normalizedName,
      amount,
      room,
      email,
      timestamp: Date.now(),
    };
    data.pledges.push(newPledge);
  }

  return await savePledges(data);
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
