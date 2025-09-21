import { NextRequest, NextResponse } from "next/server";
import { put, del } from "@vercel/blob";

const BLOB_KEY = "housekeeping-pledges.json";
const BLOB_URL_KEY = "housekeeping-pledges-url.txt";

// Verify environment variable is available
function verifyBlobToken() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error("BLOB_READ_WRITE_TOKEN environment variable is required");
  }
}

// Store the blob URL for easy retrieval
async function storeBlobUrl(url: string) {
  await put(BLOB_URL_KEY, url, {
    access: "public",
    contentType: "text/plain",
    allowOverwrite: true,
  });
}

// Get the stored blob URL
async function getBlobUrl(): Promise<string | null> {
  try {
    const response = await fetch(
      `https://blob.vercel-storage.com/${BLOB_URL_KEY}`
    );
    if (response.ok) {
      return await response.text();
    }
  } catch (error) {
    console.error("Error fetching blob URL:", error);
  }
  return null;
}

// Fetch pledges data from blob storage
async function fetchPledgesData() {
  try {
    const blobUrl = await getBlobUrl();
    if (!blobUrl) {
      return { pledges: [], startDate: Date.now() };
    }

    const response = await fetch(blobUrl);
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.error("Error fetching pledges data:", error);
  }

  return { pledges: [], startDate: Date.now() };
}

export async function GET() {
  try {
    verifyBlobToken();
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
    verifyBlobToken();
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
      lastUpdated: Date.now(),
    };

    // Store the pledges data in Vercel blob storage
    const { url } = await put(BLOB_KEY, JSON.stringify(pledgeData), {
      access: "public",
      contentType: "application/json",
      allowOverwrite: true,
    });

    // Store the blob URL for easy retrieval
    await storeBlobUrl(url);

    return NextResponse.json({
      success: true,
      url,
      message: "Pledges saved successfully",
      data: pledgeData,
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
    verifyBlobToken();
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
      lastUpdated: Date.now(),
    };

    // Update the pledges data in Vercel blob storage
    const { url } = await put(BLOB_KEY, JSON.stringify(pledgeData), {
      access: "public",
      contentType: "application/json",
      allowOverwrite: true,
    });

    // Update the stored blob URL
    await storeBlobUrl(url);

    return NextResponse.json({
      success: true,
      url,
      message: "Pledges updated successfully",
      data: pledgeData,
    });
  } catch (error) {
    console.error("Error updating pledges:", error);
    return NextResponse.json(
      { error: "Failed to update pledges" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    verifyBlobToken();
    // Delete the pledges data from Vercel blob storage
    await del(BLOB_KEY);
    await del(BLOB_URL_KEY);

    return NextResponse.json({
      success: true,
      message: "Pledges deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting pledges:", error);
    return NextResponse.json(
      { error: "Failed to delete pledges" },
      { status: 500 }
    );
  }
}
