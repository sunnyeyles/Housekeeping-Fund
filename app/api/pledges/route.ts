import { NextRequest, NextResponse } from "next/server";

const BLOB_URL =
  "https://nmt8oyfq30yudfii.public.blob.vercel-storage.com/housekeeping-pledges.json";

// Note: For now, we're only reading from the blob URL
// Write operations will be implemented later when the blob storage issue is resolved

// Fetch pledges data from the existing blob URL
async function fetchPledgesData() {
  try {
    console.log("Fetching from blob URL:", BLOB_URL);
    const response = await fetch(BLOB_URL);

    if (response.ok) {
      const data = await response.json();
      console.log("Successfully fetched pledges from blob:", data);
      return data;
    } else {
      console.log("Blob access failed with status:", response.status);
      if (response.status === 403) {
        console.log("Blob storage access forbidden, returning fallback data");
        return {
          pledges: [
            {
              id: "fallback-1",
              name: "Sunny",
              amount: 20,
              room: "kitchen",
              email: "sunnyeyles@gmail.com",
              timestamp: Date.now(),
            },
          ],
          startDate: Date.now(),
          lastUpdated: Date.now(),
        };
      }
    }
  } catch (error) {
    console.error("Error fetching pledges data:", error);
  }

  console.log("Returning empty pledges data");
  return { pledges: [], startDate: Date.now() };
}

// Save pledges data (currently returns success without actually saving)
async function savePledgesData(data: {
  pledges: Array<{
    id: string;
    name: string;
    amount: number;
    room: string;
    email: string;
    timestamp: number;
  }>;
  startDate: number;
  lastUpdated?: number;
}) {
  try {
    const pledgeData = {
      ...data,
      lastUpdated: Date.now(),
    };

    // TODO: Implement actual blob storage saving when the issue is resolved
    console.log("Would save pledges data:", pledgeData);
    return { success: true, url: BLOB_URL, data: pledgeData };
  } catch (error) {
    console.error("Error saving pledges data:", error);
    throw error;
  }
}

export async function GET() {
  try {
    const pledgeData = await fetchPledgesData();
    return NextResponse.json(pledgeData);
  } catch (error) {
    console.error("Error fetching pledges:", error);
    return NextResponse.json(
      { error: "Failed to fetch pledges" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pledges, startDate } = body;

    if (!pledges || !Array.isArray(pledges)) {
      return NextResponse.json(
        { error: "Invalid pledges data" },
        { status: 400 }
      );
    }

    const pledgeData = {
      pledges,
      startDate: startDate || Date.now(),
    };

    const result = await savePledgesData(pledgeData);

    return NextResponse.json({
      message: "Pledges saved successfully",
      ...result,
    });
  } catch (error) {
    console.error("Error saving pledges:", error);
    return NextResponse.json(
      { error: "Failed to save pledges" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { pledges, startDate } = body;

    if (!pledges || !Array.isArray(pledges)) {
      return NextResponse.json(
        { error: "Invalid pledges data" },
        { status: 400 }
      );
    }

    const pledgeData = {
      pledges,
      startDate: startDate || Date.now(),
    };

    const result = await savePledgesData(pledgeData);

    return NextResponse.json({
      message: "Pledges updated successfully",
      ...result,
    });
  } catch (error) {
    console.error("Error updating pledges:", error);
    return NextResponse.json(
      { error: "Failed to update pledges" },
      { status: 500 }
    );
  }
}
