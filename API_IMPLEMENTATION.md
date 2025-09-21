# Vercel Blob Storage API Implementation

## Overview

This implementation replaces localStorage with Vercel blob storage for persisting pledge data across sessions and devices.

## Files Modified/Created

### 1. API Route (`app/api/pledges/route.ts`)

- **GET**: Fetches pledges data from blob storage
- **POST**: Creates new pledges data in blob storage
- **PUT**: Updates existing pledges data in blob storage
- **DELETE**: Removes pledges data from blob storage

### 2. Storage Functions (`lib/storage.ts`)

- Updated all functions to be async and use API endpoints
- `loadPledges()`: Now fetches from API
- `savePledges()`: Now saves to blob storage via API
- `addPledge()`: Now handles async operations
- `getPledgesByRoom()`: Now async
- `getPledgesByPerson()`: Now async
- `getStartDate()`: Now async

### 3. Components Updated

- **HomePage** (`app/page.tsx`): Updated to handle async data loading
- **PledgeModal** (`components/pledge-modal.tsx`): Updated to handle async pledge submission

## Environment Variables Required

Create a `.env.local` file with:

```
BLOB_READ_WRITE_TOKEN=your_blob_read_write_token_here
```

Get this token from your Vercel dashboard:

1. Go to your Vercel project dashboard
2. Navigate to Storage → Blob
3. Copy the "Read/Write Token"

## How It Works

1. **Data Storage**: Pledge data is stored as JSON in Vercel blob storage
2. **URL Tracking**: The blob URL is stored in a separate blob file for easy retrieval
3. **API Endpoints**: RESTful API handles all CRUD operations
4. **Client Integration**: Frontend components use async functions to interact with the API

## Testing the Implementation

1. Start your development server: `npm run dev`
2. Open the application in your browser
3. Try adding a pledge - it should now persist to blob storage
4. Refresh the page - data should be loaded from blob storage
5. Check your Vercel dashboard to see the stored blob files

## Benefits

- ✅ Data persists across sessions
- ✅ Data is accessible from any device
- ✅ Scalable cloud storage solution
- ✅ Built-in CDN for fast access
- ✅ Automatic backup and versioning
