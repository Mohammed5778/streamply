
import { db } from './firebase';
import { Video, Channel, Comment, User } from './types';
import { FIRESTORE_COLLECTIONS, PLACEHOLDER_AVATAR } from './constants';

// Type assertion for Firebase v8 SDK if needed
const firestore = window.firebase.firestore;

export const firestoreService = {
  async getRecommendedVideos(limit: number = 5): Promise<Video[]> {
    const snapshot = await db.collection(FIRESTORE_COLLECTIONS.VIDEOS)
                           .orderBy('views', 'desc')
                           .limit(limit)
                           .get();
    const videos: Video[] = [];
    for (const doc of snapshot.docs) {
        let videoData = { id: doc.id, ...doc.data() } as Video;
        if (videoData.channelId) {
            const channel = await this.getChannelDetails(videoData.channelId);
            if (channel) {
                videoData.channelName = channel.name;
                videoData.channelAvatarUrl = channel.avatarUrl;
            }
        }
        videos.push(videoData);
    }
    return videos;
  },

  async searchVideos(query: string, limit: number = 10): Promise<Video[]> {
    if (!query.trim()) return [];
    // Firestore basic search (case-sensitive, startsWith)
    const snapshot = await db.collection(FIRESTORE_COLLECTIONS.VIDEOS)
                           .orderBy('title')
                           .startAt(query)
                           .endAt(query + '\uf8ff')
                           .limit(limit)
                           .get();
    const videos: Video[] = [];
    for (const doc of snapshot.docs) {
        let videoData = { id: doc.id, ...doc.data() } as Video;
         if (videoData.channelId) {
            const channel = await this.getChannelDetails(videoData.channelId); // Less efficient, consider denormalizing channelName for search
            if (channel) videoData.channelName = channel.name;
        }
        videos.push(videoData);
    }
    return videos;
  },

  async getVideoDetails(videoId: string): Promise<Video | null> {
    const doc = await db.collection(FIRESTORE_COLLECTIONS.VIDEOS).doc(videoId).get();
    if (!doc.exists) return null;
    let videoData = { id: doc.id, ...doc.data() } as Video;
    if (videoData.channelId) {
        const channel = await this.getChannelDetails(videoData.channelId);
        if (channel) {
            videoData.channelName = channel.name;
            videoData.channelAvatarUrl = channel.avatarUrl;
            videoData.channelSubscribersCount = channel.subscribersCount;
        }
    }
    return videoData;
  },

  async getChannelDetails(channelId: string): Promise<Channel | null> {
    const doc = await db.collection(FIRESTORE_COLLECTIONS.CHANNELS).doc(channelId).get();
    return doc.exists ? { id: doc.id, ...doc.data() } as Channel : null;
  },

  async getComments(videoId: string, limit: number = 5): Promise<Comment[]> {
    const snapshot = await db.collection(FIRESTORE_COLLECTIONS.VIDEOS).doc(videoId)
                           .collection(FIRESTORE_COLLECTIONS.COMMENTS)
                           .orderBy('timestamp', 'desc')
                           .limit(limit)
                           .get();
    return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() } as Comment));
  },

  async getCommentsCount(videoId: string): Promise<number> {
    // This could be expensive. Consider a counter field on the video document itself.
    const snapshot = await db.collection(FIRESTORE_COLLECTIONS.VIDEOS).doc(videoId)
                           .collection(FIRESTORE_COLLECTIONS.COMMENTS)
                           .get();
    return snapshot.size;
  },


  async getUpNextVideos(currentVideoId: string, limit: number = 3): Promise<Video[]> {
    const snapshot = await db.collection(FIRESTORE_COLLECTIONS.VIDEOS)
                           .where(firestore.FieldPath.documentId(), '!=', currentVideoId) 
                           .limit(limit) // Add .orderBy for more relevant "up next" like uploadDate or views
                           .get(); 

    const videos: Video[] = [];
    for (const doc of snapshot.docs) {
        let videoData = { id: doc.id, ...doc.data() } as Video;
        if (videoData.channelId) { 
            const channel = await this.getChannelDetails(videoData.channelId);
            if (channel) videoData.channelName = channel.name;
        }
        videos.push(videoData);
    }
    return videos;
  },

  async getChannelVideos(channelId: string, limit: number = 10): Promise<Video[]> {
    const snapshot = await db.collection(FIRESTORE_COLLECTIONS.VIDEOS)
                           .where('channelId', '==', channelId)
                           .orderBy('uploadDate', 'desc') 
                           .limit(limit)
                           .get();
    return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() } as Video));
  },

  async getWatchHistory(userId: string, limit: number = 5): Promise<Video[]> {
    // This requires a user-specific collection or subcollection for watch history.
    // For this demo, we'll fetch recent videos as a proxy if user-specific history isn't implemented.
    // Replace this with actual user watch history logic when available.
    const userDocRef = db.collection(FIRESTORE_COLLECTIONS.USERS).doc(userId);
    const historySnapshot = await userDocRef.collection('watchHistory')
                                       .orderBy('lastWatched', 'desc')
                                       .limit(limit)
                                       .get();
    
    const videoIds = historySnapshot.docs.map((doc: any) => doc.data().videoId);
    if (videoIds.length === 0) return [];

    const videos: Video[] = [];
    // Fetch video details for each ID. This can be optimized with multiple `in` queries if Firestore supports it well or batched reads.
    for (const videoId of videoIds) {
        const video = await this.getVideoDetails(videoId);
        if (video) videos.push(video);
    }
    return videos;
  },

  async addVideoToWatchHistory(userId: string, videoId: string): Promise<void> {
    if (!userId || !videoId) return;
    const userDocRef = db.collection(FIRESTORE_COLLECTIONS.USERS).doc(userId);
    // Use videoId as document ID in subcollection for easy overwrite/update of timestamp
    await userDocRef.collection('watchHistory').doc(videoId).set({
      videoId: videoId,
      lastWatched: firestore.Timestamp.now()
    });
  },

  async createChannel(userId: string, name: string, avatarUrl?: string): Promise<string> {
    const channelData: Omit<Channel, 'id'> = {
      name,
      ownerId: userId,
      avatarUrl: avatarUrl || PLACEHOLDER_AVATAR,
      subscribersCount: 0,
      videoCount: 0,
      bannerUrl: '', // Default empty banner
    };
    const docRef = await db.collection(FIRESTORE_COLLECTIONS.CHANNELS).add(channelData);
    return docRef.id;
  },

  async getUserChannel(userId: string): Promise<Channel | null> {
    const snapshot = await db.collection(FIRESTORE_COLLECTIONS.CHANNELS)
                           .where('ownerId', '==', userId)
                           .limit(1)
                           .get();
    if (snapshot.empty) {
      return null;
    }
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as Channel;
  },

  async addVideoMetadata(videoData: Omit<Video, 'id' | 'views' | 'likes' | 'dislikes'> & { channelId: string }): Promise<string> {
    const dataToAdd = {
      ...videoData,
      views: 0,
      likes: 0,
      dislikes: 0,
      uploadDate: firestore.Timestamp.now(), // Ensure uploadDate is a Timestamp
    };
    const docRef = await db.collection(FIRESTORE_COLLECTIONS.VIDEOS).add(dataToAdd);
    
    // Increment videoCount on the channel
    if (videoData.channelId) {
      const channelRef = db.collection(FIRESTORE_COLLECTIONS.CHANNELS).doc(videoData.channelId);
      await channelRef.update({
        videoCount: firestore.FieldValue.increment(1)
      });
    }
    return docRef.id;
  },

  async updateChannelDetails(channelId: string, details: { name?: string; avatarUrl?: string; bannerUrl?: string }): Promise<void> {
    const channelRef = db.collection(FIRESTORE_COLLECTIONS.CHANNELS).doc(channelId);
    // Filter out undefined values to prevent overwriting fields with undefined
    const updates: Partial<Channel> = {};
    if (details.name !== undefined) updates.name = details.name;
    if (details.avatarUrl !== undefined) updates.avatarUrl = details.avatarUrl;
    if (details.bannerUrl !== undefined) updates.bannerUrl = details.bannerUrl;
    
    if (Object.keys(updates).length > 0) {
        await channelRef.update(updates);
    }
  }
};