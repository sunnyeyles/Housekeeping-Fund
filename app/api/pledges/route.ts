import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";

const BLOB_URL =
  "https://nmt8oyfq30yudfii.public.blob.vercel-storage.com/housekeeping-pledges.json";

// Verify environment variable is available
function verifyBlobToken() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error("BLOB_READ_WRITE_TOKEN environment variable is required");
  }
}

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

// Save pledges data to the existing blob URL
async function savePledgesData(data: any) {
  try {
    verifyBlobToken();

    const pledgeData = {
      ...data,
      lastUpdated: Date.now(),
    };

    // Save to the existing blob URL using Vercel blob storage
    const { url } = await put(BLOB_URL, JSON.stringify(pledgeData), {
      access: "public",
      contentType: "application/json",
      allowOverwrite: true,
    });

    console.log("Stored pledges data at URL:", url);
    return { success: true, url, data: pledgeData };
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
      success: true,
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
      success: true,
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
