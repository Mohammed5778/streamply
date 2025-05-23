
import { Timestamp } from 'firebase/firestore'; // Assuming v9, for v8 it's firebase.firestore.Timestamp

// New User interface for Firebase Auth user
export interface User {
  uid: string;
  displayName?: string | null;
  email?: string | null;
  photoURL?: string | null;
}

export interface Video {
  id: string;
  title: string;
  description?: string; // Added
  channelId?: string;
  channelName?: string;
  channelAvatarUrl?: string;
  views: number | string; // Can be string like "200k" or number
  uploadDate: Timestamp | string; // Changed to allow Timestamp
  duration: string;
  thumbnailUrl: string;
  videoUrl?: string; // Added for actual video playback
  likes?: number | string;
  dislikes?: number | string; // Added for dislike count
  lastWatched?: Timestamp;
  channelSubscribersCount?: number | string; // Added for VideoPage display
  isShort?: boolean; // Added to distinguish Shorts
  // Add other fields as necessary from your Firestore structure
}

export interface Channel {
  id: string;
  name: string;
  avatarUrl: string;
  bannerUrl?: string; // Added for channel banner
  subscribersCount: number | string;
  videoCount: number | string;
  ownerId?: string; // Added to link channel to a user
  // Add other fields
}

export interface Comment {
  id: string;
  userId: string;
  userAvatarUrl?: string;
  userName?: string; // Added for better display
  text: string;
  timestamp: Timestamp; // Or Date, depending on how you store it
}

export interface Playlist {
    id: string;
    name: string;
    videoCount: number;
    icon: string; // Icon identifier string
    thumbnailUrl?: string; // Optional: for a playlist preview
}

export type PageId =
  | 'home'
  | 'search'
  | 'video'
  | 'library'
  | 'channel'
  | 'shorts'
  | 'create' // Page for creating content/channel
  | 'subscriptions'
  | 'auth'; // New page for authentication

export interface PageContext {
  videoId?: string;
  channelId?: string;
  query?: string;
  playlistId?: string;
  forceReload?: boolean;
  previousPageId?: PageId;
  isBackNavigation?: boolean;
  intendedPage?: PageId; // For redirecting after login
  intendedContext?: PageContext; // Context for the intended page
}