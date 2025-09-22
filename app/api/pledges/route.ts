import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

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

export async function GET() {
  try {
    // Fetch pledges data from Redis
    const pledgesData = await redis.get<PledgeData>("housekeeping-pledges");

    if (pledgesData) {
      return NextResponse.json(pledgesData);
    }

    // Return empty data if no pledges exist in Redis
    const emptyData: PledgeData = {
      pledges: [],
      startDate: Date.now() - 604800000, // 7 days ago
      lastUpdated: Date.now(),
    };

    // Store empty data in Redis for future use
    await redis.set("housekeeping-pledges", emptyData);

    return NextResponse.json(emptyData);
  } catch (error) {
    console.error("Error fetching pledges from Redis:", error);
    return NextResponse.json(
      { error: "Failed to fetch pledges" },
      { status: 500 }
    );
  }
}
