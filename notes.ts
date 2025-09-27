// create user profile with authentication
// user can create a house and add rooms to it
// user can add people to the house
// user can add tasks to the house
// room have status dirty and clean
// ai analysis of the room when image is uploaded

// signup onboarding flow
// 1. enter email
// 2. enter name
// 3. enter password
// 4. enter confirm password
// 5. enter phone number
// 6. enter address

// setup onboarding flow
// 1. enter house name
// 2. enter rooms
// 3. enter room status
// 4. enter room image
// 5. enter room description
// 6. enter room tasks

// add roommates onboarding flow
// 1. send invite to roommates
// 2. roommates accept invite

// what would be the best signup onboarding flow? how would you design it? Must a user create a room? If they decide not to what will be shown? Just an empty dashboard?

// ===== COMPREHENSIVE FEATURE DESIGN =====

// Core Features:
// 1. Housekeeping Fund (Current) - Pledge system for shared expenses, room-based contributions, progress tracking
// 2. Room Management - Add rooms to houses, room status (clean/dirty), room photos, room descriptions
// 3. People Management - Add roommates to houses, user profiles, invite system, role management (admin/member)
// 4. Task System - Daily/Weekly Tasks, Recurring Tasks, One-time Tasks, Task Assignment, Task Status

// Data Structure:
interface House {
  id: string;
  name: string;
  adminId: string;
  members: User[];
  rooms: Room[];
  tasks: Task[];
  //   fund: Fund;
}

interface Room {
  id: string;
  name: string;
  status: "clean" | "dirty";
  image?: string;
  description?: string;
  lastCleaned?: Date;
}

interface Task {
  id: string;
  title: string;
  description?: string;
  type: "daily" | "weekly" | "monthly" | "custom" | "one-time";
  frequency?: number; // days/weeks/months
  assignedTo?: string;
  status: "pending" | "in-progress" | "completed" | "overdue";
  dueDate?: Date;
  roomId?: string;
  createdAt: Date;
  completedAt?: Date;
}

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  houses: string[]; // house IDs
}

// Onboarding Flow:
// Phase 1: Account Setup - Email + password, Name, Email verification
// Phase 2: House Creation - "Create your first house", House name, Add rooms (with templates), Upload room photos (optional)
// Phase 3: Invite Roommates - "Invite your roommates?", Email invites, Wait for acceptances
// Phase 4: Task Setup - "Set up your cleaning tasks", Choose from templates or create custom, Set frequencies, Assign initial tasks

// UI/UX Considerations:
// Dashboard Layout:
// ┌─────────────────┬─────────────────┐
// │ 🏠 House Fund   │ 📋 Today's Tasks│
// │ $45/120         │ • Take rubbish  │
// │ [Contribute]    │ • Wash dishes   │
// └─────────────────┴─────────────────┘
// ┌─────────────────┬─────────────────┐
// │ 🏠 Rooms        │ 👥 Roommates    │
// │ 🧹 Kitchen      │ • John (admin)  │
// │ 🧹 Bathroom     │ • Sarah         │
// │ 🧹 Living Room  │ • Mike          │
// └─────────────────┴─────────────────┘

// Task Management:
// - Calendar view for recurring tasks
// - Push notifications for due tasks
// - Photo proof for completed tasks
// - Points/rewards system

// Implementation Priority:
// Phase 1: User accounts + house creation
// Phase 2: Room management + basic tasks
// Phase 3: Recurring tasks + assignments
// Phase 4: Notifications + advanced features

// Task Examples:
// Daily/Weekly: "Take rubbish out", "Wash dishes", "Vacuum"
// Recurring: "Clean fridge" (monthly), "Deep clean bathroom" (bi-monthly)
// One-time: "Fix leaky tap", "Paint room"
//
