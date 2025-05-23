
import { PageId } from './types'; // Ensure PageId is imported from types.ts

export const DEFAULT_PAGE: PageId = 'home';

export const FIRESTORE_COLLECTIONS = {
  VIDEOS: 'videos',
  CHANNELS: 'channels',
  COMMENTS: 'comments', // Subcollection under videos
  USERS: 'users', // Potentially for storing user-specific app data beyond auth
};

// Placeholder image URLs
export const PLACEHOLDER_THUMBNAIL = 'https://picsum.photos/320/180';
export const PLACEHOLDER_AVATAR = 'https://picsum.photos/40/40';
export const PLACEHOLDER_VIDEO_URL = "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";


// Canary Yellow Theme Constants
export const THEME_YELLOW_PRIMARY = '#FFDE00';
export const THEME_YELLOW_BUTTON_TEXT = '#1A1300'; // Dark text for yellow buttons
export const THEME_BG_PRIMARY = '#121212';
export const THEME_BG_SECONDARY = '#1E1E1E';
export const THEME_TEXT_ON_DARK_PRIMARY = '#FFFFFF';
export const THEME_TEXT_ON_DARK_SECONDARY = '#B3B3B3';
export const THEME_BLACK_FOR_SHORTS = '#000000';
export const THEME_BORDER_PRIMARY = '#383838';
export const THEME_BG_TERTIARY_HOVER = '#2A2A2A';


export const PAGE_THEMES: Record<PageId, { statusBarColor: string, bodyBgColor: string }> = {
    home: { statusBarColor: THEME_BG_PRIMARY, bodyBgColor: THEME_BG_PRIMARY },
    search: { statusBarColor: '#0F0F0F', bodyBgColor: '#0F0F0F' }, // Distinct dark for Search focus
    video: { statusBarColor: '#0A0A0A', bodyBgColor: '#0A0A0A' },   // Distinct very dark for Video player focus
    library: { statusBarColor: THEME_BG_PRIMARY, bodyBgColor: THEME_BG_PRIMARY },
    channel: { statusBarColor: THEME_BG_PRIMARY, bodyBgColor: THEME_BG_PRIMARY },
    shorts: { statusBarColor: THEME_BLACK_FOR_SHORTS, bodyBgColor: THEME_BLACK_FOR_SHORTS },
    create: { statusBarColor: THEME_BG_PRIMARY, bodyBgColor: THEME_BG_PRIMARY },
    subscriptions: { statusBarColor: THEME_BG_PRIMARY, bodyBgColor: THEME_BG_PRIMARY },
    auth: { statusBarColor: THEME_BG_PRIMARY, bodyBgColor: THEME_BG_PRIMARY }, // Theme for AuthPage
};

// Filter categories for Home page
export const HOME_FILTERS = ['All', 'Music', 'Gaming', 'Live', 'News', 'Sports', 'Education'];
// Channel tabs
export const CHANNEL_TABS = ['Home', 'Videos', 'Playlists', 'Community', 'About'];