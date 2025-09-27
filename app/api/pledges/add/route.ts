import { Redis } from "@upstash/redis";
import { NextRequest, NextResponse } from "next/server";
import { TOTAL_TARGET } from "@/lib/config";

// Initialize Redis with Upstash environment variables
const redis = Redis.fromEnv();

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

// Normalize name: trim, lowercase, then capitalize first letter
function normalizeName(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "";
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, amount, room, email } = body;

    // Validate required fields
    if (!name || !amount || !room || !email) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate amount
    const pledgeAmount = Number.parseFloat(amount);
    if (isNaN(pledgeAmount) || pledgeAmount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    // Validate room
    if (!["bathroom", "kitchen", "lounge"].includes(room)) {
      return NextResponse.json({ error: "Invalid room" }, { status: 400 });
    }

    // Get current pledges data from Redis
    let pledgesData = await redis.get<PledgeData>("housekeeping-pledges");

    if (!pledgesData) {
      // Initialize with default data if no pledges exist
      pledgesData = {
        pledges: [],
        startDate: Date.now() - 604800000, // 7 days ago
        lastUpdated: Date.now(),
      };
    }

    const normalizedName = normalizeName(name);

    // Enforce remaining target limit server-side
    const totalSoFar = pledgesData.pledges.reduce(
      (sum, p) => sum + p.amount,
      0
    );
    const remaining = Math.max(0, TOTAL_TARGET - totalSoFar);
    if (pledgeAmount > remaining) {
      return NextResponse.json(
        {
          error: `Amount exceeds remaining available: ${remaining.toFixed(2)}`,
        },
        { status: 400 }
      );
    }

    // Find existing pledge from same person for same room and update, or create new
    const existingIndex = pledgesData.pledges.findIndex(
      (p) =>
        p.name.toLowerCase() === normalizedName.toLowerCase() && p.room === room
    );

    if (existingIndex >= 0) {
      // Update existing pledge
      pledgesData.pledges[existingIndex].amount += pledgeAmount;
      pledgesData.pledges[existingIndex].email = email;
      pledgesData.pledges[existingIndex].timestamp = Date.now();
    } else {
      // Create new pledge
      const newPledge: Pledge = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: normalizedName,
        amount: pledgeAmount,
        room,
        email,
        timestamp: Date.now(),
      };
      pledgesData.pledges.push(newPledge);
    }

    // Update lastUpdated timestamp
    pledgesData.lastUpdated = Date.now();

    // Save to Redis
    await redis.set("housekeeping-pledges", pledgesData);

    return NextResponse.json({ success: true, data: pledgesData });
  } catch (error) {
    console.error("Error adding pledge to Redis:", error);
    return NextResponse.json(
      { error: "Failed to add pledge" },
      { status: 500 }
    );
  }
}
