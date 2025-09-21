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
}

const STORAGE_KEY = "cleaning-pledges";

// Normalize name: trim, lowercase, then capitalize first letter
export function normalizeName(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "";
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
}

export function loadPledges(): PledgeData {
  if (typeof window === "undefined") {
    return { pledges: [], startDate: Date.now() };
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("Error loading pledges:", error);
  }

  // Initialize with start date if no data exists
  const initialData = { pledges: [], startDate: Date.now() };
  savePledges(initialData);
  return initialData;
}

export function savePledges(data: PledgeData): void {
  if (typeof window === "undefined") return;

  try {
    // localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    console.log("Saving pledges:", data);
  } catch (error) {
    console.error("Error saving pledges:", error);
  }
}

export function addPledge(
  name: string,
  amount: number,
  room: Pledge["room"],
  email: string
): void {
  const data = loadPledges();
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

  savePledges(data);
}

export function getPledgesByRoom(): Record<Pledge["room"], number> {
  const data = loadPledges();
  return data.pledges.reduce(
    (acc, pledge) => {
      acc[pledge.room] = (acc[pledge.room] || 0) + pledge.amount;
      return acc;
    },
    { bathroom: 0, kitchen: 0, lounge: 0 } as Record<Pledge["room"], number>
  );
}

export function getPledgesByPerson(): Array<{
  name: string;
  total: number;
  email: string;
}> {
  const data = loadPledges();
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

export function getStartDate(): number {
  const data = loadPledges();
  return data.startDate;
}
