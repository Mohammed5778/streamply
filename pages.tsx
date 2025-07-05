import React, { useState, useEffect, useCallback, useRef } from 'react';
import { User, Video, Channel, Comment as CommentType, Playlist, PageId, PageContext } from './types';
import { firestoreService } from './services';
import { signInWithGoogle, signOut as firebaseSignOut, signUpWithEmailPassword, signInWithEmailPassword, uploadFileToStorage, getVideoDurationFromFile } from './firebase'; // Firebase auth functions
import {
    LoadingSpinner, ErrorMessage, VideoCard, PlaylistItemCard, CommentItem, ChannelHeader, ChannelCard,
    MagnifyingGlassIcon, BackIcon, ClearIcon, SettingsIcon, PlayIcon as VideoPlayIcon,
    ThumbsUpIcon, ThumbsDownIconPhosphor as ThumbsDownIcon, ShareIcon, PlaylistAddIcon, // Using ThumbsDownIconPhosphor
    MoreVertIcon, CameraIcon, GoogleIcon, UserIcon, SortIcon, GridIcon
} from './components';
import {
    HOME_FILTERS, CHANNEL_TABS, PLACEHOLDER_AVATAR, PLACEHOLDER_THUMBNAIL, PLACEHOLDER_VIDEO_URL,
    THEME_YELLOW_PRIMARY, THEME_YELLOW_BUTTON_TEXT, THEME_TEXT_ON_DARK_PRIMARY, THEME_TEXT_ON_DARK_SECONDARY,
    THEME_BG_PRIMARY, THEME_BG_SECONDARY, THEME_BORDER_PRIMARY, THEME_BLACK_FOR_SHORTS,
    THEME_BG_TERTIARY_HOVER, PAGE_THEMES
} from './constants';
import { formatViews, formatFirestoreTimestamp } from './firebase';

// Firebase v8 specific import for Timestamp
const Timestamp = window.firebase.firestore.Timestamp;


interface PageProps {
  navigateTo: (page: PageId, context?: PageContext) => void;
  context?: PageContext;
  currentUser: User | null; // Pass current user to pages that need it
}

const FOOTER_HEIGHT_RESPONSIVE_PADDING = "pb-[calc(58px+env(safe-area-inset-bottom))] md:pb-[env(safe-area-inset-bottom)]";


export const HomePage: React.FC<PageProps> = ({ navigateTo, currentUser }) => {
  const [recommendedVideos, setRecommendedVideos] = useState<Video[]>([]);
  const [favoriteChannelsData, setFavoriteChannelsData] = useState<{channels: Channel[], videos: Video[]}>({channels: [], videos: []});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState('All');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const recVideos = await firestoreService.getRecommendedVideos(10); // Increased count for desktop
        setRecommendedVideos(recVideos);
        
        // Get favorite channels data (mock data for now)
        const mockChannels: Channel[] = [
          { id: 'ch1', name: 'Tech Reviews', avatarUrl: 'https://picsum.photos/64/64?random=1', subscribersCount: '2.5M', videoCount: 150, bannerUrl: '' },
          { id: 'ch2', name: 'Cooking Master', avatarUrl: 'https://picsum.photos/64/64?random=2', subscribersCount: '1.8M', videoCount: 89, bannerUrl: '' },
          { id: 'ch3', name: 'Travel Vlogs', avatarUrl: 'https://picsum.photos/64/64?random=3', subscribersCount: '950K', videoCount: 67, bannerUrl: '' },
          { id: 'ch4', name: 'Music Studio', avatarUrl: 'https://picsum.photos/64/64?random=4', subscribersCount: '3.2M', videoCount: 234, bannerUrl: '' },
          { id: 'ch5', name: 'Fitness Pro', avatarUrl: 'https://picsum.photos/64/64?random=5', subscribersCount: '1.2M', videoCount: 78, bannerUrl: '' },
        ];
        
        const favVideos = await firestoreService.getRecommendedVideos(8); // Get videos for favorite channels section
        setFavoriteChannelsData({ channels: mockChannels, videos: favVideos });
      } catch (err) {
        console.error("Error loading home page data:", err);
        setError('Failed to load videos. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleVideoClick = (videoId: string) => {
    if (currentUser && currentUser.uid && videoId) {
        firestoreService.addVideoToWatchHistory(currentUser.uid, videoId);
    }
    navigateTo('video', { videoId })
  };
  const handleChannelClick = (channelId: string) => navigateTo('channel', { channelId });

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="flex-grow overflow-y-auto custom-scrollbar">
      <div className={`sticky top-0 z-10 flex items-center bg-[${THEME_BG_PRIMARY}] p-4 md:px-6 lg:px-8 pb-3 justify-between h-[72px]`}>
        <div className="flex items-center gap-2">
          <div className={`text-[${THEME_YELLOW_PRIMARY}] flex size-8 shrink-0 items-center justify-center rounded-full`}>
            <VideoPlayIcon size="24px" />
          </div>
          <h1 className={`text-[${THEME_TEXT_ON_DARK_PRIMARY}] text-2xl font-bold leading-tight tracking-tighter`}>Streamply</h1>
        </div>
        <div className="flex items-center justify-end gap-2">
           <button
            onClick={() => navigateTo('search')}
            className={`flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 w-10 bg-transparent text-[${THEME_TEXT_ON_DARK_PRIMARY}] gap-2 text-base font-bold leading-normal tracking-[0.015em] min-w-0 p-0 hover:bg-[${THEME_BG_TERTIARY_HOVER}] active:bg-[${THEME_BG_SECONDARY}] transition-colors`}>
            <MagnifyingGlassIcon className={`text-[${THEME_TEXT_ON_DARK_PRIMARY}]`} size="24px" />
          </button>
          {currentUser ? (
             <img src={currentUser.photoURL || PLACEHOLDER_AVATAR} alt="User Avatar" className="size-8 rounded-full cursor-pointer" onClick={() => navigateTo('auth')} />
          ) : (
            <button onClick={() => navigateTo('auth')} className={`flex items-center justify-center rounded-full h-10 w-10 text-[${THEME_TEXT_ON_DARK_PRIMARY}] hover:bg-[${THEME_BG_TERTIARY_HOVER}]`}>
                <UserIcon />
            </button>
          )}
        </div>
      </div>
      <div className={`sticky top-[72px] z-10 bg-[${THEME_BG_PRIMARY}] h-[52px]`}>
        <div className={`flex gap-3 p-4 md:px-6 lg:px-8 pt-0 overflow-x-auto whitespace-nowrap no-scrollbar`}>
            {HOME_FILTERS.map(filter => (
            <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-lg px-4 text-sm font-medium leading-normal shadow-sm transition-colors
                ${activeFilter === filter
                    ? `bg-[${THEME_YELLOW_PRIMARY}] text-[${THEME_YELLOW_BUTTON_TEXT}] font-semibold`
                    : `bg-[${THEME_BG_SECONDARY}] text-[${THEME_TEXT_ON_DARK_PRIMARY}] hover:bg-[${THEME_BG_TERTIARY_HOVER}] active:bg-[${THEME_BG_SECONDARY}]`}`}
            >
                {filter}
            </button>
            ))}
        </div>
      </div>
      <section className="px-4 md:px-6 lg:px-8 pb-4">
        <h2 className={`text-[${THEME_TEXT_ON_DARK_PRIMARY}] text-xl font-bold leading-tight tracking-[-0.015em] pb-3 pt-2`}>Recommended</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {recommendedVideos.length > 0 ? recommendedVideos.map(video => (
            <VideoCard key={video.id} video={video} type="home" onVideoClick={handleVideoClick} onChannelClick={handleChannelClick} />
          )) : <p className={`text-[${THEME_TEXT_ON_DARK_SECONDARY}] text-center col-span-full`}>No recommended videos found.</p>}
        </div>
      </section>
      
      {/* Enhanced Favorite Channels Section */}
      <section className={`px-4 md:px-6 lg:px-8 ${FOOTER_HEIGHT_RESPONSIVE_PADDING}`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className={`text-[${THEME_TEXT_ON_DARK_PRIMARY}] text-xl font-bold leading-tight tracking-[-0.015em]`}>Favorite Channels</h2>
          <button className={`text-[${THEME_YELLOW_PRIMARY}] text-sm font-medium hover:underline`}>
            View All
          </button>
        </div>
        
        {/* Channels Row */}
        <div className="mb-6">
          <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
            {favoriteChannelsData.channels.length > 0 ? favoriteChannelsData.channels.map(channel => (
              <div key={channel.id} className="flex-shrink-0 w-20">
                <ChannelCard 
                  channel={channel} 
                  onChannelClick={handleChannelClick}
                />
              </div>
            )) : (
              <p className={`text-[${THEME_TEXT_ON_DARK_SECONDARY}] text-center w-full`}>No favorite channels found.</p>
            )}
          </div>
        </div>
        
        {/* Latest Videos from Favorite Channels */}
        <div>
          <h3 className={`text-[${THEME_TEXT_ON_DARK_PRIMARY}] text-lg font-semibold leading-tight tracking-[-0.015em] mb-3`}>Latest from your subscriptions</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
            {favoriteChannelsData.videos.length > 0 ? favoriteChannelsData.videos.map(video => (
              <VideoCard key={video.id} video={video} type="favoriteChannels" onVideoClick={handleVideoClick} onChannelClick={handleChannelClick} />
            )) : <p className={`text-[${THEME_TEXT_ON_DARK_SECONDARY}] text-center col-span-full`}>No videos from favorite channels found.</p>}
          </div>
        </div>
      </section>
    </div>
  );
};

export const SearchPage: React.FC<PageProps> = ({ navigateTo, context, currentUser }) => {
  const [searchTerm, setSearchTerm] = useState(context?.query || '');
  const [results, setResults] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchPageTheme = PAGE_THEMES['search'];

  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setResults([]); setError(null); return;
    }
    setLoading(true); setError(null);
    try {
      const videos = await firestoreService.searchVideos(query);
      setResults(videos);
    } catch (err) {
      console.error("Error performing search:", err);
      setError('Failed to search videos. Please try again.');
      setResults([]);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (context?.query && context.query !== searchTerm) { // Avoid re-searching if query hasn't changed
        setSearchTerm(context.query);
        performSearch(context.query);
    }
  }, [context?.query, performSearch, searchTerm]);

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value);
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => { if (e.key === 'Enter') performSearch(searchTerm); };
  const clearSearch = () => { setSearchTerm(''); setResults([]); setError(null); };
  const handleVideoClick = (videoId: string) => {
    if (currentUser && currentUser.uid && videoId) {
        firestoreService.addVideoToWatchHistory(currentUser.uid, videoId);
    }
    navigateTo('video', { videoId })
  };

  return (
    <div className={`flex-grow overflow-y-auto custom-scrollbar text-[${THEME_TEXT_ON_DARK_PRIMARY}]`}>
      <header className="sticky top-0 z-10 backdrop-blur-sm h-[calc(56px+72px)]" style={{backgroundColor: `${searchPageTheme.statusBarColor}CC`}}> {/* CC for ~80% opacity */}
        <div className="flex items-center p-4 md:px-6 lg:px-8 pb-2 justify-between h-[56px]">
          <button onClick={() => navigateTo(context?.previousPageId || 'home', {isBackNavigation: true})} className={`text-[${THEME_TEXT_ON_DARK_PRIMARY}] flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-[${THEME_YELLOW_PRIMARY}]/10 transition-colors`}>
            <BackIcon />
          </button>
          <h2 className="text-xl font-bold leading-tight tracking-[-0.015em] flex-1 text-center">Search</h2>
          <div className="size-10 shrink-0"></div>
        </div>
        <div className="px-4 md:px-6 lg:px-8 py-3 h-[72px]">
          <div className={`flex w-full max-w-xl mx-auto items-stretch rounded-xl bg-[${THEME_BG_SECONDARY}] h-12`}>
            <div className={`text-[${THEME_YELLOW_PRIMARY}] flex items-center justify-center pl-4`}>
              <MagnifyingGlassIcon size="20px" />
            </div>
            <input
              className={`form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden bg-transparent text-[${THEME_TEXT_ON_DARK_PRIMARY}] focus:outline-none focus:ring-0 border-none h-full placeholder:text-[${THEME_TEXT_ON_DARK_SECONDARY}] px-3 text-base font-normal leading-normal`}
              placeholder="Search videos, channels..."
              value={searchTerm}
              onChange={handleSearchInputChange}
              onKeyPress={handleKeyPress}
              autoFocus
            />
            {searchTerm && (
              <button onClick={clearSearch} className={`flex items-center justify-center pr-4 text-[${THEME_YELLOW_PRIMARY}] hover:opacity-80`}>
                <ClearIcon />
              </button>
            )}
          </div>
        </div>
      </header>
      <main className={`px-4 md:px-6 lg:px-8 py-3 space-y-3 max-w-3xl mx-auto ${FOOTER_HEIGHT_RESPONSIVE_PADDING}`}>
        <h3 className={`text-[${THEME_TEXT_ON_DARK_PRIMARY}] text-lg font-semibold leading-tight tracking-[-0.015em] pb-1 pt-2`}>
          {results.length > 0 || loading || error ? 'Search Results' : 'Top results'}
        </h3>
        {loading && <LoadingSpinner />}
        {error && <ErrorMessage message={error} />}
        {!loading && !error && results.length === 0 && !searchTerm && (
          <div className={`text-[${THEME_TEXT_ON_DARK_SECONDARY}] p-4 text-center`}>Enter a search term to find videos.</div>
        )}
        {!loading && !error && results.length === 0 && searchTerm && (
          <div className={`text-[${THEME_TEXT_ON_DARK_SECONDARY}] p-4 text-center`}>No videos found matching your search.</div>
        )}
        {!loading && !error && results.length > 0 && results.map(video => (
          <VideoCard key={video.id} video={video} type="search" onVideoClick={handleVideoClick} />
        ))}
      </main>
    </div>
  );
};

export const VideoPage: React.FC<PageProps> = ({ navigateTo, context, currentUser }) => {
  const videoId = context?.videoId;
  const [video, setVideo] = useState<Video | null>(null);
  const [comments, setComments] = useState<CommentType[]>([]);
  const [commentsCount, setCommentsCount] = useState(0);
  const [upNext, setUpNext] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const videoPageTheme = PAGE_THEMES['video'];

  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false); // Mock subscription state

  useEffect(() => {
    if (!videoId) { setError("Video ID is missing."); setLoading(false); return; }
    const fetchData = async () => {
      setLoading(true); setError(null);
      try {
        const videoDetails = await firestoreService.getVideoDetails(videoId);
        if (!videoDetails) { setError("Video not found."); setLoading(false); return; }
        setVideo(videoDetails);
        
        if (currentUser?.uid && videoId) { // Add to history only if user is logged in
            firestoreService.addVideoToWatchHistory(currentUser.uid, videoId);
        }

        const fetchedComments = await firestoreService.getComments(videoId);
        setComments(fetchedComments);
        setCommentsCount(await firestoreService.getCommentsCount(videoId));
        const upNextVideos = await firestoreService.getUpNextVideos(videoId);
        setUpNext(upNextVideos);
      } catch (err) {
        console.error("Error loading video page:", err);
        setError('Failed to load video details.');
      } finally { setLoading(false); }
    };
    fetchData();
  }, [videoId, currentUser?.uid]); // Added currentUser.uid as dependency for history

  const handleChannelNavigation = () => { if (video?.channelId) navigateTo('channel', { channelId: video.channelId }); };
  const handleUpNextVideoClick = (nextVideoId: string) => {
    if (currentUser && currentUser.uid && nextVideoId) {
        firestoreService.addVideoToWatchHistory(currentUser.uid, nextVideoId);
    }
    navigateTo('video', { videoId: nextVideoId, previousPageId: 'video' });
  }

  const handleLike = () => {
    if (!currentUser) { navigateTo('auth', { intendedPage: 'video', intendedContext: context }); return; }
    setIsLiked(!isLiked);
    if (!isLiked && isDisliked) setIsDisliked(false); 
    alert(isLiked ? "Video unliked (placeholder)" : "Video liked! (placeholder)");
  };
  const handleDislike = () => {
    if (!currentUser) { navigateTo('auth', { intendedPage: 'video', intendedContext: context }); return; }
    setIsDisliked(!isDisliked);
    if (!isDisliked && isLiked) setIsLiked(false); 
    alert(isDisliked ? "Dislike removed (placeholder)" : "Video disliked! (placeholder)");
  };
  const handleShare = () => alert("Share: Functionality coming soon!");
  const handleSave = () => {
    if (!currentUser) { navigateTo('auth', { intendedPage: 'video', intendedContext: context }); return; }
    alert("Save to playlist: Functionality coming soon!");
  };
  const handleSubscribe = () => {
    if (!currentUser) { navigateTo('auth', { intendedPage: 'video', intendedContext: context }); return; }
    setIsSubscribed(!isSubscribed);
    alert(isSubscribed ? `Unsubscribed from ${video?.channelName} (placeholder)` : `Subscribed to ${video?.channelName}! (placeholder)`);
  };


  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!video) return <ErrorMessage message="Video data could not be loaded." />;

  return (
    <div className={`flex-grow overflow-y-auto custom-scrollbar text-[${THEME_TEXT_ON_DARK_PRIMARY}] lg:overflow-y-visible ${FOOTER_HEIGHT_RESPONSIVE_PADDING}`}>
       <div style={{backgroundColor: videoPageTheme.statusBarColor}} className={`flex items-center p-4 md:px-6 lg:px-0 pb-2 justify-between sticky top-0 z-50 h-[56px] lg:max-w-screen-2xl lg:mx-auto`}>
          <button onClick={() => navigateTo(context?.previousPageId || 'home', {isBackNavigation: true})} className={`text-[${THEME_TEXT_ON_DARK_PRIMARY}] flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-[${THEME_BG_TERTIARY_HOVER}] transition-colors`}>
              <BackIcon />
          </button>
          <div className="flex items-center justify-end">
              <button className={`flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 w-10 bg-transparent text-[${THEME_TEXT_ON_DARK_PRIMARY}] hover:bg-[${THEME_BG_TERTIARY_HOVER}] transition-colors`}>
                  <SettingsIcon />
              </button>
          </div>
      </div>
      
      <div className="lg:flex lg:gap-6 max-w-screen-2xl mx-auto lg:px-4">
        <div className="lg:w-2/3 lg:flex-grow"> {/* Main content column (video, desc, comments) */}
          <div className="relative flex items-center justify-center bg-cover bg-center aspect-video bg-black lg:rounded-xl lg:overflow-hidden">
              <video
                src={video.videoUrl || PLACEHOLDER_VIDEO_URL}
                poster={video.thumbnailUrl || PLACEHOLDER_THUMBNAIL}
                controls
                className="w-full h-full"
                autoPlay={false}
              />
          </div>
          <div className="p-4 space-y-1">
              <h1 className={`text-[${THEME_TEXT_ON_DARK_PRIMARY}] text-xl md:text-2xl font-bold leading-tight tracking-tight`}>{video.title}</h1>
              <p className={`text-[${THEME_TEXT_ON_DARK_SECONDARY}] text-sm font-normal leading-normal`}>{formatViews(video.views)} views · {formatFirestoreTimestamp(video.uploadDate)}</p>
              {video.description && <p className={`text-[${THEME_TEXT_ON_DARK_SECONDARY}] text-sm mt-2 whitespace-pre-wrap`}>{video.description}</p>}
          </div>

          {/* Action Buttons Row */}
          <div className={`flex items-center gap-2 px-4 py-2 overflow-x-auto no-scrollbar lg:overflow-x-visible bg-[${videoPageTheme.bodyBgColor}] border-t border-b border-[${THEME_BORDER_PRIMARY}]`}>
              <button
                onClick={handleLike}
                className={`flex items-center gap-2 p-2.5 rounded-full text-[${isLiked ? THEME_YELLOW_PRIMARY : THEME_TEXT_ON_DARK_PRIMARY}] bg-[${THEME_BG_SECONDARY}] hover:bg-[${THEME_BG_TERTIARY_HOVER}] transition-colors`}
                aria-pressed={isLiked}
                title="Like"
              >
                  <ThumbsUpIcon isFilled={isLiked} />
                  <span className="text-sm font-medium">{formatViews(video.likes)}</span>
              </button>
              <button
                onClick={handleDislike}
                className={`flex items-center gap-1 p-2.5 rounded-full text-[${isDisliked ? THEME_YELLOW_PRIMARY : THEME_TEXT_ON_DARK_PRIMARY}] bg-[${THEME_BG_SECONDARY}] hover:bg-[${THEME_BG_TERTIARY_HOVER}] transition-colors`}
                aria-pressed={isDisliked}
                title="Dislike"
              >
                  <ThumbsDownIcon isFilled={isDisliked} />
              </button>
              <button
                onClick={handleShare}
                className={`flex items-center gap-2 p-2.5 rounded-full text-[${THEME_TEXT_ON_DARK_PRIMARY}] bg-[${THEME_BG_SECONDARY}] hover:bg-[${THEME_BG_TERTIARY_HOVER}] transition-colors`}
                title="Share"
              >
                  <ShareIcon />
                  <span className="text-sm font-medium">Share</span>
              </button>
              <button
                onClick={handleSave}
                className={`flex items-center gap-2 p-2.5 rounded-full text-[${THEME_TEXT_ON_DARK_PRIMARY}] bg-[${THEME_BG_SECONDARY}] hover:bg-[${THEME_BG_TERTIARY_HOVER}] transition-colors`}
                title="Save"
              >
                  <PlaylistAddIcon />
                  <span className="text-sm font-medium">Save</span>
              </button>
              <button className={`flex items-center p-2.5 rounded-full text-[${THEME_TEXT_ON_DARK_PRIMARY}] bg-[${THEME_BG_SECONDARY}] hover:bg-[${THEME_BG_TERTIARY_HOVER}] transition-colors`} title="More options">
                    <MoreVertIcon />
                </button>
          </div>

          <div style={{backgroundColor: videoPageTheme.bodyBgColor}} className={`flex items-center gap-3 px-4 py-3 border-b border-[${THEME_BORDER_PRIMARY}]`}>
              <div className="flex items-center gap-3 flex-1 cursor-pointer" onClick={handleChannelNavigation}>
                  <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-10 w-10 shrink-0" style={{ backgroundImage: `url("${video.channelAvatarUrl || PLACEHOLDER_AVATAR}")` }}></div>
                  <div className='flex flex-col'>
                    <p className={`text-[${THEME_TEXT_ON_DARK_PRIMARY}] text-base font-medium leading-normal flex-1 truncate`}>{video.channelName || 'Channel Name'}</p>
                    <p className={`text-[${THEME_TEXT_ON_DARK_SECONDARY}] text-xs`}>{formatViews(video.channelSubscribersCount)} subscribers</p>
                  </div>
              </div>
              <div className="shrink-0">
                  <button
                    onClick={handleSubscribe}
                    className={`flex min-w-[100px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-9 px-4 text-sm font-semibold leading-normal tracking-tight transition-all
                    ${isSubscribed ? `bg-[${THEME_BG_SECONDARY}] text-[${THEME_TEXT_ON_DARK_SECONDARY}] hover:bg-[${THEME_BG_TERTIARY_HOVER}]` : `bg-[${THEME_YELLOW_PRIMARY}] text-[${THEME_YELLOW_BUTTON_TEXT}] hover:opacity-90`}`}
                  >
                      <span className="truncate">{isSubscribed ? 'Subscribed' : 'Subscribe'}</span>
                  </button>
              </div>
          </div>

          <div className={`px-4 py-3 border-t border-[${THEME_BORDER_PRIMARY}]`} style={{backgroundColor: videoPageTheme.bodyBgColor}}>
              <div className="flex items-center justify-between mb-3">
                  <h3 className={`text-[${THEME_TEXT_ON_DARK_PRIMARY}] text-base font-semibold leading-tight`}>Comments ({commentsCount})</h3>
              </div>
              <div className="space-y-3">
                  {comments.length > 0 ? comments.map(comment => (
                      <CommentItem key={comment.id} comment={comment} />
                  )) : <p className={`text-[${THEME_TEXT_ON_DARK_SECONDARY}] text-center`}>No comments yet.</p>}
              </div>
          </div>
        </div>

        <div className={`lg:w-1/3 lg:max-w-sm lg:shrink-0 lg:sticky lg:top-[calc(56px+env(safe-area-inset-top))] lg:h-[calc(100vh-56px-env(safe-area-inset-top)-env(safe-area-inset-bottom))] lg:overflow-y-auto custom-scrollbar border-t lg:border-t-0 border-[${THEME_BORDER_PRIMARY}] lg:pt-0`} style={{backgroundColor: videoPageTheme.bodyBgColor}}>
          <h3 className={`text-[${THEME_TEXT_ON_DARK_PRIMARY}] text-lg font-semibold leading-tight tracking-tight px-4 pb-2 pt-4 lg:pt-0`}>Up Next</h3>
          <div className="space-y-0">
            {upNext.length > 0 ? upNext.map(nextVideo => (
              <VideoCard key={nextVideo.id} video={nextVideo} type="upNext" onVideoClick={handleUpNextVideoClick} />
            )) : <p className={`text-[${THEME_TEXT_ON_DARK_SECONDARY}] text-center px-4`}>No more videos.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export const LibraryPage: React.FC<PageProps> = ({ navigateTo, currentUser }) => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [history, setHistory] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const libraryPageTheme = PAGE_THEMES['library'];

  useEffect(() => {
    if (!currentUser) { 
      setLoading(false);
      setError("Please login to view your library.");
      return;
    }
    const loadData = async () => {
      setLoading(true); setError(null);
      try {
        const mockPlaylists: Playlist[] = [
          { id: 'wl', name: 'Watch Later', videoCount: 10, icon: 'Clock' },
          { id: 'lv', name: 'Liked videos', videoCount: 25, icon: 'ThumbsUp' },
          { id: 'mp1', name: 'My Playlist #1', videoCount: 15, icon: 'List' }
        ];
        setPlaylists(mockPlaylists);
        if (currentUser.uid) { // Check if UID exists before fetching history
            const watchHistory = await firestoreService.getWatchHistory(currentUser.uid, 10); 
            setHistory(watchHistory);
        } else {
            setHistory([]); // No user, no history
        }
      } catch (err) {
        console.error("Error loading library data:", err);
        setError("Failed to load library. Please try again.");
      } finally { setLoading(false); }
    };
    loadData();
  }, [currentUser]);

  const handleVideoClick = (videoId: string) => {
    // History already updated on click, just navigate
    navigateTo('video', { videoId })
  };
  const handlePlaylistClick = (playlistId: string) => alert(`Navigate to playlist: ${playlistId}`);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!currentUser) return <ErrorMessage message="Please login to view your library." />;


  return (
    <div className={`flex-grow overflow-y-auto text-[${THEME_TEXT_ON_DARK_PRIMARY}]`}>
      <header className="sticky top-0 z-10 backdrop-blur-sm h-[60px]" style={{backgroundColor: `${libraryPageTheme.statusBarColor}CC`}}> {/* CC for ~80% opacity */}
          <div className="flex items-center p-4 md:px-6 lg:px-8 pb-3 justify-between">
              <div className="w-12"></div>
              <h1 className={`text-xl font-bold text-[${THEME_TEXT_ON_DARK_PRIMARY}] tracking-tight flex-1 text-center`}>Library</h1>
              <div className="flex w-12 items-center justify-end">
                  <button onClick={() => navigateTo('search')} className={`flex items-center justify-center rounded-full h-10 w-10 text-[${THEME_TEXT_ON_DARK_PRIMARY}] hover:bg-[${THEME_BG_TERTIARY_HOVER}] transition-colors duration-200`}>
                      <MagnifyingGlassIcon />
                  </button>
              </div>
          </div>
      </header>
      <main className={`px-4 md:px-6 lg:px-8 pt-4 max-w-4xl mx-auto ${FOOTER_HEIGHT_RESPONSIVE_PADDING}`}>
          <section className="mb-6">
              <h2 className={`text-[${THEME_TEXT_ON_DARK_PRIMARY}] text-lg font-semibold leading-tight tracking-[-0.01em] mb-3`}>Playlists</h2>
              <ul className="space-y-1">
                {playlists.length > 0 ? playlists.map(pl => (
                  <PlaylistItemCard key={pl.id} playlist={pl} onClick={handlePlaylistClick} />
                )) : <li className={`text-[${THEME_TEXT_ON_DARK_SECONDARY}] text-center`}>No playlists found.</li>}
              </ul>
          </section>
          <section>
              <h2 className={`text-[${THEME_TEXT_ON_DARK_PRIMARY}] text-lg font-semibold leading-tight tracking-[-0.01em] mb-3`}>History</h2>
              <ul className="space-y-1">
                {history.length > 0 ? history.map(video => (
                  <VideoCard key={video.id} video={video} type="libraryHistory" onVideoClick={handleVideoClick} />
                )): <li className={`text-[${THEME_TEXT_ON_DARK_SECONDARY}] text-center`}>No watch history.</li>}
              </ul>
          </section>
      </main>
    </div>
  );
};

export const ChannelPage: React.FC<PageProps> = ({ navigateTo, context, currentUser }) => {
  const channelId = context?.channelId;
  const [channel, setChannel] = useState<Channel | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('Home'); 
  const [sortBy, setSortBy] = useState('Latest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const channelPageTheme = PAGE_THEMES['channel'];
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isNotificationEnabled, setIsNotificationEnabled] = useState(false);

  useEffect(() => {
    if (!channelId) { setError("Channel ID is missing."); setLoading(false); return; }
    const fetchData = async () => {
      setLoading(true); setError(null);
      try {
        const channelDetails = await firestoreService.getChannelDetails(channelId);
        if (!channelDetails) { setError("Channel not found."); setChannel(null); setLoading(false); return; }
        setChannel(channelDetails);
        const channelVideos = await firestoreService.getChannelVideos(channelId);
        setVideos(channelVideos);
      } catch (err) {
        console.error("Error loading channel page:", err);
        setError('Failed to load channel details.');
      } finally { setLoading(false); }
    };
    fetchData();
  }, [channelId]);

  const handleVideoClick = (videoId: string) => {
    if (currentUser && currentUser.uid && videoId) {
        firestoreService.addVideoToWatchHistory(currentUser.uid, videoId);
    }
    navigateTo('video', { videoId });
  }
  
  const handleSubscribe = () => {
    if (!currentUser) { navigateTo('auth', { intendedPage: 'channel', intendedContext: context }); return; }
    setIsSubscribed(!isSubscribed);
    alert(isSubscribed ? `Unsubscribed from ${channel?.name} (placeholder)` : `Subscribed to ${channel?.name}! (placeholder)`);
  };

  const handleNotificationToggle = () => {
    if (!currentUser) { navigateTo('auth', { intendedPage: 'channel', intendedContext: context }); return; }
    setIsNotificationEnabled(!isNotificationEnabled);
    alert(isNotificationEnabled ? `Notifications turned off for ${channel?.name}` : `Notifications turned on for ${channel?.name}!`);
  };

  const sortOptions = ['Latest', 'Popular', 'Oldest'];

  if (loading) return <LoadingSpinner />;
  if (!loading && !channel && !error) return <ErrorMessage message="Channel not found." />;
  if (error) return <ErrorMessage message={error} />;
  if (!channel) return <ErrorMessage message="Channel data could not be loaded." />;

  return (
    <div className={`flex-grow overflow-y-auto text-[${THEME_TEXT_ON_DARK_PRIMARY}]`}>
       <header className="sticky top-0 z-20 backdrop-blur-md h-[71px]" style={{backgroundColor: `${channelPageTheme.statusBarColor}CC`}}>
          <div className="flex items-center p-4 md:px-6 lg:px-8 pb-3 justify-between">
              <button onClick={() => navigateTo(context?.previousPageId || 'home', {isBackNavigation: true})} className={`text-[${THEME_TEXT_ON_DARK_PRIMARY}] flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-[${THEME_BG_TERTIARY_HOVER}] transition-colors`}>
                  <BackIcon />
              </button>
              <h2 className={`text-[${THEME_TEXT_ON_DARK_PRIMARY}] text-xl font-bold leading-tight tracking-tight flex-1 text-center pr-10`}>{channel.name}</h2>
          </div>
      </header>
      
      <main className="flex flex-col">
        {/* Enhanced Channel Header */}
        <ChannelHeader 
          channel={channel} 
          onSubscribe={handleSubscribe} 
          isSubscribed={isSubscribed}
          videosCount={videos.length}
          showNotificationBell={true}
          onNotificationToggle={handleNotificationToggle}
          isNotificationEnabled={isNotificationEnabled}
        />
        
        {/* Channel Navigation Tabs */}
        <div className={`pb-0 sticky top-[71px] z-10 backdrop-blur-md border-b border-[${THEME_BORDER_PRIMARY}] h-[49px]`} style={{backgroundColor: `${channelPageTheme.bodyBgColor}CC`}}>
            <div className="flex px-2 md:px-4 md:justify-center gap-1 overflow-x-auto whitespace-nowrap no-scrollbar md:overflow-x-visible">
                {CHANNEL_TABS.map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-grow basis-0 md:flex-grow-0 md:basis-auto text-center py-3 px-2 md:px-4 text-sm font-medium border-b-2 transition-all duration-200 ease-in-out
                            ${activeTab === tab
                                ? `border-[${THEME_YELLOW_PRIMARY}] text-[${THEME_YELLOW_PRIMARY}]`
                                : `border-transparent text-[${THEME_TEXT_ON_DARK_SECONDARY}] hover:text-[${THEME_TEXT_ON_DARK_PRIMARY}] hover:border-[${THEME_YELLOW_PRIMARY}]/50`}`}
                    >
                        {tab}
                    </button>
                ))}
            </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'Home' && (
          <div className={`${FOOTER_HEIGHT_RESPONSIVE_PADDING}`}>
            {/* Featured Video Section */}
            {videos.length > 0 && (
              <section className="p-4 md:p-6 lg:p-8">
                <h3 className={`text-[${THEME_TEXT_ON_DARK_PRIMARY}] text-lg font-semibold mb-4`}>Featured Video</h3>
                <div className="max-w-2xl">
                  <VideoCard video={videos[0]} type="home" onVideoClick={handleVideoClick} />
                </div>
              </section>
            )}
            
            {/* Recent Uploads */}
            <section className="p-4 md:p-6 lg:p-8 pt-0">
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-[${THEME_TEXT_ON_DARK_PRIMARY}] text-lg font-semibold`}>Recent uploads</h3>
                <button 
                  onClick={() => setActiveTab('Videos')}
                  className={`text-[${THEME_YELLOW_PRIMARY}] text-sm font-medium hover:underline`}
                >
                  View all
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {videos.slice(0, 4).map(video => (
                  <VideoCard key={video.id} video={video} type="channel" onVideoClick={handleVideoClick} />
                ))}
              </div>
            </section>
          </div>
        )}

        {activeTab === 'Videos' && (
          <div className={`${FOOTER_HEIGHT_RESPONSIVE_PADDING}`}>
            {/* Sort and View Controls */}
            <div className="flex items-center justify-between p-4 md:px-6 lg:px-8 border-b border-[${THEME_BORDER_PRIMARY}]">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <SortIcon className={`text-[${THEME_TEXT_ON_DARK_SECONDARY}]`} />
                  <select 
                    value={sortBy} 
                    onChange={(e) => setSortBy(e.target.value)}
                    className={`bg-[${THEME_BG_SECONDARY}] text-[${THEME_TEXT_ON_DARK_PRIMARY}] border border-[${THEME_BORDER_PRIMARY}] rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[${THEME_YELLOW_PRIMARY}]`}
                  >
                    {sortOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? `bg-[${THEME_YELLOW_PRIMARY}] text-[${THEME_YELLOW_BUTTON_TEXT}]` : `text-[${THEME_TEXT_ON_DARK_SECONDARY}] hover:bg-[${THEME_BG_TERTIARY_HOVER}]`}`}
                >
                  <GridIcon />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? `bg-[${THEME_YELLOW_PRIMARY}] text-[${THEME_YELLOW_BUTTON_TEXT}]` : `text-[${THEME_TEXT_ON_DARK_SECONDARY}] hover:bg-[${THEME_BG_TERTIARY_HOVER}]`}`}
                >
                  <SortIcon />
                </button>
              </div>
            </div>

            {/* Videos Grid/List */}
            <div className="p-4 md:p-6 lg:p-8">
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-x-3 gap-y-5">
                  {videos.length > 0 ? videos.map(video => (
                    <VideoCard key={video.id} video={video} type="channel" onVideoClick={handleVideoClick} />
                  )) : <p className={`text-[${THEME_TEXT_ON_DARK_SECONDARY}] text-center col-span-full py-8`}>This channel has no videos yet.</p>}
                </div>
              ) : (
                <div className="space-y-3">
                  {videos.length > 0 ? videos.map(video => (
                    <VideoCard key={video.id} video={video} type="search" onVideoClick={handleVideoClick} />
                  )) : <p className={`text-[${THEME_TEXT_ON_DARK_SECONDARY}] text-center py-8`}>This channel has no videos yet.</p>}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'Playlists' && (
          <div className={`p-8 text-center text-[${THEME_TEXT_ON_DARK_SECONDARY}] ${FOOTER_HEIGHT_RESPONSIVE_PADDING}`}>
            <h3 className={`text-[${THEME_TEXT_ON_DARK_PRIMARY}] text-xl font-semibold mb-4`}>Playlists</h3>
            <p>This channel hasn't created any playlists yet.</p>
          </div>
        )}

        {activeTab === 'Community' && (
          <div className={`p-8 text-center text-[${THEME_TEXT_ON_DARK_SECONDARY}] ${FOOTER_HEIGHT_RESPONSIVE_PADDING}`}>
            <h3 className={`text-[${THEME_TEXT_ON_DARK_PRIMARY}] text-xl font-semibold mb-4`}>Community</h3>
            <p>Community posts will appear here.</p>
          </div>
        )}

        {activeTab === 'About' && (
          <div className={`p-4 md:p-6 lg:p-8 ${FOOTER_HEIGHT_RESPONSIVE_PADDING}`}>
            <div className="max-w-2xl">
              <h3 className={`text-[${THEME_TEXT_ON_DARK_PRIMARY}] text-xl font-semibold mb-6`}>About {channel.name}</h3>
              
              <div className="space-y-6">
                <div>
                  <h4 className={`text-[${THEME_TEXT_ON_DARK_PRIMARY}] text-lg font-medium mb-2`}>Channel Stats</h4>
                  <div className={`text-[${THEME_TEXT_ON_DARK_SECONDARY}] space-y-1`}>
                    <p>• {formatViews(channel.subscribersCount)} subscribers</p>
                    <p>• {videos.length} videos</p>
                    <p>• Joined YouTube on Jan 1, 2020</p>
                  </div>
                </div>
                
                {channel.description && (
                  <div>
                    <h4 className={`text-[${THEME_TEXT_ON_DARK_PRIMARY}] text-lg font-medium mb-2`}>Description</h4>
                    <p className={`text-[${THEME_TEXT_ON_DARK_SECONDARY}] leading-relaxed whitespace-pre-wrap`}>
                      {channel.description}
                    </p>
                  </div>
                )}
                
                <div>
                  <h4 className={`text-[${THEME_TEXT_ON_DARK_PRIMARY}] text-lg font-medium mb-2`}>Links</h4>
                  <div className={`text-[${THEME_TEXT_ON_DARK_SECONDARY}] space-y-1`}>
                    <p>• Website: example.com</p>
                    <p>• Twitter: @{channel.name.toLowerCase().replace(/\s+/g, '')}</p>
                    <p>• Instagram: @{channel.name.toLowerCase().replace(/\s+/g, '')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};


export const ShortsPage: React.FC<PageProps> = ({ navigateTo, currentUser }) => {
  const shortItem = {
    videoUrl: PLACEHOLDER_VIDEO_URL, 
    thumbnailUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCYwGC4IZVwpvlrzGoclJ6hwkk86NL9sFVLeCxUAbJ-iRWeendW5dsJCG4au1-6n1VR2vjD7Jo1MxZOStp623jgXiVgnrEP28pZJmsgO6rzLhcY4M_n5YT7hMJI2f8nkDKTtfJY41ci0W8fPny787GE_lxcWsgijp0K4a3iUrb1Y6ZGnZjFGorh-LdIy57yPXL6BR76sLRzLf0adw9kdtPyRH6uvz823srHU_I0OQ8CEgByQr3BYpb1dGoR8CR5a1VXW-YzjkL_hX0",
    userAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAjdnidBJWozoKWqRdJBLxNt6ZykbK3z9zFy7M37IyX0xlv_ZuiQCdQGfHCLWhLh8TBYKFb52nHTmzvkynf9x98vJQ-R5oVt8Q2Py5QRqYY_zCcJK9ZtXiK7IHLPC72In2gkabaO0yU3xIDGVB4cLRjRy8Naf3AgdalUfY6iqV-VdmqdUBCTCYMAb7j-yVB9NyJBQYx_kuPngT8npoPISc8DXrz4oKZFgp-0gl-4QgSDuXpShPaphomX4dDx_BdzbMwVnvJggAmYuw",
    username: "@coolcreator",
    title: "Epic Fail Compilation #shorts #fail #funny 😂",
    audioTitle: "Original Audio - CreatorSounds",
    likes: "1.2M",
    comments: "5.6K",
    albumArt: "https://lh3.googleusercontent.com/aida-public/AB6AXuA3FAG6WpPzouGEgzQZYUCB7YVsZL5nfamAZmFMU1YDMYCxcVd10qcktxpJbur03M_Pxg8cxi_dH9icPLVoC0mmL54HULhgvKbn3JPRSq8oFHlxMpJFSnVK0OD5US2E5pHfwEPzhGaBnLcDxgFllHWILjBQ15cUw_Q0J-HVY5QaU9CmQG2KxuW7qtGZP3hNVzZqcT9MNC0nHIHG-E4TV4FdbfFIizPkD0ooqYenoGqQswO4qPizr2eRnvGFoiyK0yOQ2NnYIl3clZc"
  };

  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isFollowingThisShortUser, setIsFollowingThisShortUser] = useState(false);


  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play().catch(error => console.error("Error playing video:", error));
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation(); 
    if (!currentUser) { navigateTo('auth', { intendedPage: 'shorts', intendedContext: {} }); return; }
    setIsFavorited(!isFavorited);
    alert(isFavorited ? "Removed from favorites (placeholder)" : "Added to favorites! (placeholder)");
  };

  const handleComment = (e: React.MouseEvent) => { e.stopPropagation(); alert("View comments: Functionality coming soon!"); };
  const handleShareShort = (e: React.MouseEvent) => { e.stopPropagation(); alert("Share Short: Functionality coming soon!"); };
  const handleFollowShortUser = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) { navigateTo('auth', { intendedPage: 'shorts', intendedContext: {} }); return; }
    setIsFollowingThisShortUser(!isFollowingThisShortUser);
    alert(isFollowingThisShortUser ? `Unfollowed ${shortItem.username} (placeholder)` : `Followed ${shortItem.username}! (placeholder)`);
  };
  const handleMoreOptions = (e: React.MouseEvent) => { e.stopPropagation(); alert("More options: Functionality coming soon!"); };

  return (
    <div className={`flex flex-col h-screen bg-[${THEME_BLACK_FOR_SHORTS}] text-white`}>
      <header className={`sticky top-0 z-50 flex items-center bg-[${THEME_BLACK_FOR_SHORTS}] p-4 md:px-6 lg:px-8 pb-2 justify-between h-[56px]`}>
        <button className="flex items-center justify-center text-white h-10 w-10 hover:bg-white/10 rounded-full transition-colors" onClick={() => navigateTo('search')}>
          <MagnifyingGlassIcon className="text-2xl" />
        </button>
        <h1 className="text-white text-xl font-bold leading-tight tracking-[-0.015em] flex-1 text-center">Shorts</h1>
        <button className="flex items-center justify-center text-white h-10 w-10 hover:bg-white/10 rounded-full transition-colors" onClick={() => navigateTo('create', { previousPageId: 'shorts' })}>
            <CameraIcon className="text-2xl" />
        </button>
      </header>

      <main className="flex-grow overflow-y-auto no-scrollbar relative" onClick={togglePlay}>
        <div
          className="relative flex items-center justify-center bg-black md:max-w-xs lg:max-w-sm mx-auto"
          style={{ height: 'calc(100vh - 56px - 50px - env(safe-area-inset-top) - env(safe-area-inset-bottom))' }}
        >
          <video
            ref={videoRef}
            src={shortItem.videoUrl}
            poster={shortItem.thumbnailUrl}
            loop
            playsInline 
            className="w-full h-full object-contain" 
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />
          {!isPlaying && (
            <button className="absolute inset-0 flex items-center justify-center text-white opacity-80 hover:opacity-100 transition-opacity duration-300">
              <span className="material-icons text-6xl bg-black/50 rounded-full p-3">play_arrow</span>
            </button>
          )}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
            <div className="flex justify-between items-end">
              <div className="text-white">
                <div className="flex items-center gap-2 mb-1">
                  <img alt="User Avatar" className="w-8 h-8 rounded-full border-2 border-white" src={shortItem.userAvatar || PLACEHOLDER_AVATAR} />
                  <p className="font-semibold text-sm">{shortItem.username}</p>
                  <button
                    onClick={handleFollowShortUser}
                    className={`px-3 py-1 text-xs font-bold rounded-md hover:opacity-90 transition-opacity ${isFollowingThisShortUser ? `bg-white/20 text-white` : `bg-[${THEME_YELLOW_PRIMARY}] text-[${THEME_YELLOW_BUTTON_TEXT}]`}`}
                  >
                    {isFollowingThisShortUser ? 'Following': 'Follow'}
                  </button>
                </div>
                <p className="text-xs mb-1 line-clamp-2">{shortItem.title}</p>
                <div className="flex items-center gap-1 text-xs">
                  <span className="material-icons text-sm">music_note</span>
                  <span>{shortItem.audioTitle}</span>
                </div>
              </div>
              <div className="flex flex-col items-center gap-3 text-white">
                <button onClick={handleFavorite} className="flex flex-col items-center hover:scale-110 transition-transform">
                  <span className={`material-icons text-3xl ${isFavorited ? `text-[${THEME_YELLOW_PRIMARY}]` : ''}`}>{isFavorited ? 'favorite' : 'favorite_border'}</span>
                  <span className="text-xs font-semibold">{shortItem.likes}</span>
                </button>
                <button onClick={handleComment} className="flex flex-col items-center hover:scale-110 transition-transform">
                  <span className="material-icons text-3xl">chat_bubble_outline</span>
                  <span className="text-xs font-semibold">{shortItem.comments}</span>
                </button>
                <button onClick={handleShareShort} className="flex flex-col items-center hover:scale-110 transition-transform">
                  <span className="material-icons text-3xl">send</span>
                </button>
                <button onClick={handleMoreOptions} className="flex flex-col items-center hover:scale-110 transition-transform">
                  <span className="material-icons text-3xl">more_horiz</span>
                </button>
                <img alt="Album Art" className="w-10 h-10 rounded-full border-2 border-white animate-spin" style={{animationDuration: '5s'}} src={shortItem.albumArt || PLACEHOLDER_THUMBNAIL} />
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className={`sticky bottom-0 z-50 border-t border-[${THEME_BORDER_PRIMARY}] bg-[${THEME_BLACK_FOR_SHORTS}]`}>
        <nav className="flex justify-around items-center px-2 pt-2 pb-3 text-xs">
          <button onClick={() => navigateTo('home')} className={`flex flex-col items-center justify-end gap-0.5 text-[${THEME_TEXT_ON_DARK_SECONDARY}] hover:text-white transition-colors`}>
            <span className="material-icons text-2xl">home</span>
            <span className="font-medium">Home</span>
          </button>
          <button onClick={() => { /* Already on Shorts */ }} className={`flex flex-col items-center justify-end gap-0.5 text-[${THEME_YELLOW_PRIMARY}] font-bold`}>
            <span className={`material-icons text-2xl text-[${THEME_YELLOW_PRIMARY}]`}>smart_display</span>
            <span className="font-medium">Shorts</span>
          </button>
          <button onClick={() => navigateTo('create', { previousPageId: 'shorts' })} className={`flex flex-col items-center justify-center text-[${THEME_TEXT_ON_DARK_SECONDARY}] hover:text-white transition-colors`}>
            <span className={`material-icons text-4xl p-1 bg-[${THEME_YELLOW_PRIMARY}] rounded-full text-[${THEME_YELLOW_BUTTON_TEXT}] -mt-3 hover:opacity-90 transition-opacity`}>add_circle_outline</span>
          </button>
          <button onClick={() => navigateTo('subscriptions')} className={`flex flex-col items-center justify-end gap-0.5 text-[${THEME_TEXT_ON_DARK_SECONDARY}] hover:text-white transition-colors`}>
            <span className="material-icons text-2xl">subscriptions</span>
            <span className="font-medium">Subscriptions</span>
          </button>
          <button onClick={() => currentUser ? navigateTo('library') : navigateTo('auth')} className={`flex flex-col items-center justify-end gap-0.5 text-[${THEME_TEXT_ON_DARK_SECONDARY}] hover:text-white transition-colors`}>
            {currentUser ? <span className="material-icons text-2xl">video_library</span> : <UserIcon size="24px"/>}
            <span className="font-medium">{currentUser ? "Library" : "Login"}</span>
          </button>
        </nav>
        <div className={`pb-[env(safe-area-inset-bottom)] bg-[${THEME_BLACK_FOR_SHORTS}]`}></div>
      </footer>
    </div>
  );
};

export const AuthPage: React.FC<PageProps> = ({ navigateTo, context, currentUser }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSuccessNavigation = () => {
    const { intendedPage, intendedContext, previousPageId } = context || {};
    if (intendedPage) {
      navigateTo(intendedPage, intendedContext);
    } else {
      navigateTo(previousPageId || 'home', { isBackNavigation: !!previousPageId });
    }
  };
  
  const handleAuthAction = async (authFn: () => Promise<any>) => {
    setLoading(true);
    setError(null);
    try {
      await authFn();
    } catch (rawError: any) {
      console.error("Auth error:", rawError);
      let errorCode = rawError.code; 
      let errorMessage = rawError.message; 

      if (rawError.error && typeof rawError.error === 'object') {
        if (!errorCode && rawError.error.message) {
            errorMessage = rawError.error.message;
            if (rawError.error.message === 'INVALID_LOGIN_CREDENTIALS') {
                errorCode = 'auth/invalid-credential'; 
            }
        }
      } else if (typeof rawError.message === 'string') {
          try {
              const parsedMessage = JSON.parse(rawError.message);
              if (parsedMessage.error && parsedMessage.error.message) {
                  if(!errorCode) errorMessage = parsedMessage.error.message;
                  if (parsedMessage.error.message === 'INVALID_LOGIN_CREDENTIALS' && !errorCode) {
                      errorCode = 'auth/invalid-credential';
                  }
              }
          } catch (e) { /* Not JSON */ }
      }

      let friendlyMessage = "An unexpected error occurred. Please try again.";
      switch (errorCode) {
        case 'auth/invalid-email': friendlyMessage = "Please enter a valid email address."; break;
        case 'auth/user-disabled': friendlyMessage = "This account has been disabled."; break;
        case 'auth/user-not-found': friendlyMessage = "No account found with this email. Please sign up or check your email."; break;
        case 'auth/wrong-password': friendlyMessage = "Incorrect password. Please try again."; break;
        case 'auth/email-already-in-use': friendlyMessage = "An account already exists with this email address."; break;
        case 'auth/weak-password': friendlyMessage = "Password is too weak. It should be at least 6 characters."; break;
        case 'auth/requires-recent-login': friendlyMessage = "This action requires a recent login. Please sign out and sign in again."; break;
        case 'auth/invalid-credential':  friendlyMessage = "Invalid login credentials. Please check your email and password, or sign up if you don't have an account."; break;
        case 'auth/popup-blocked': friendlyMessage = "Popup was blocked by your browser. Please allow popups for this site and try again."; break;
        case 'auth/popup-closed-by-user': friendlyMessage = "Sign-in was cancelled. Please try again."; break;
        case 'auth/cancelled-popup-request': friendlyMessage = "Sign-in was cancelled. Please try again."; break;
        default:
            if (errorMessage && (errorMessage !== rawError.message || !rawError.code)) { friendlyMessage = errorMessage; } 
            else if (rawError.message) { friendlyMessage = rawError.message; }
            break;
      }
      setError(friendlyMessage);
    } finally { setLoading(false); }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
    } catch (rawError: any) {
      console.error("Google Sign-In error:", rawError);
      let friendlyMessage = "Failed to sign in with Google. Please try again.";
      
      if (rawError.code === 'auth/popup-blocked') {
        friendlyMessage = "Popup was blocked by your browser. Please allow popups for this site and try again.";
      } else if (rawError.code === 'auth/popup-closed-by-user') {
        friendlyMessage = "Sign-in was cancelled. Please try again.";
      } else if (rawError.code === 'auth/cancelled-popup-request') {
        friendlyMessage = "Sign-in was cancelled. Please try again.";
      }
      
      setError(friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError("Email and password cannot be empty."); return; }
    handleAuthAction(() => signInWithEmailPassword(email, password));
  };
  const handleEmailSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError("Email and password cannot be empty."); return; }
    handleAuthAction(() => signUpWithEmailPassword(email, password));
  };

  const handleSignOut = async () => {
    setLoading(true); setError(null);
    try {
      await firebaseSignOut();
      navigateTo('home'); 
    } catch (err: any) {
      console.error("Error signing out:", err);
      setError(err.message || "Failed to sign out.");
    } finally { setLoading(false); }
  };
  
  useEffect(() => {
    if (currentUser && loading === false && !error) { handleSuccessNavigation(); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, loading, error]); 


  const pageTheme = PAGE_THEMES['auth'];

  return (
    <div className={`flex-grow flex flex-col items-center justify-center text-[${THEME_TEXT_ON_DARK_PRIMARY}] p-4 ${FOOTER_HEIGHT_RESPONSIVE_PADDING}`}>
        <header className="absolute top-0 left-0 right-0 z-10 w-full h-[60px]" style={{backgroundColor: `${pageTheme.statusBarColor}CC`}}>
            <div className="flex items-center p-4 md:px-6 lg:px-8 pb-3 justify-start">
                {(context?.previousPageId && !currentUser) && ( 
                    <button onClick={() => navigateTo(context.previousPageId || 'home', {isBackNavigation: true})} className={`text-[${THEME_TEXT_ON_DARK_PRIMARY}] flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-[${THEME_BG_TERTIARY_HOVER}] transition-colors`}>
                        <BackIcon />
                    </button>
                )}
            </div>
        </header>

        <div className="w-full max-w-md text-center">
            {loading && <LoadingSpinner />}
            {!loading && error && <ErrorMessage message={error} />}

            {!loading && currentUser ? (
                <div className="space-y-6">
                    <img
                        src={currentUser.photoURL || PLACEHOLDER_AVATAR}
                        alt="User Avatar"
                        className="size-24 rounded-full mx-auto ring-4 ring-yellow-500/50"
                    />
                    <h1 className="text-2xl font-bold">Welcome, {currentUser.displayName || currentUser.email || 'User'}!</h1>
                    {currentUser.email && <p className={`text-lg text-[${THEME_TEXT_ON_DARK_SECONDARY}]`}>{currentUser.email}</p>}
                    <button
                        onClick={handleSignOut}
                        className={`w-full bg-[${THEME_YELLOW_PRIMARY}] text-[${THEME_YELLOW_BUTTON_TEXT}] px-6 py-3 rounded-full text-lg font-bold hover:opacity-90 transition-opacity shadow-lg`}
                    >
                        Sign Out
                    </button>
                </div>
            ) : !loading && (
                <div className="space-y-6">
                    <UserIcon size="60px" className={`mx-auto text-[${THEME_YELLOW_PRIMARY}]`} />
                    <h1 className="text-3xl font-bold">Login or Sign Up</h1>
                    <p className={`text-md text-[${THEME_TEXT_ON_DARK_SECONDARY}]`}>
                        Access your library, subscriptions, and create your own channel.
                    </p>
                    
                    <form onSubmit={handleEmailSignIn} className="space-y-4">
                        <div>
                            <label htmlFor="email" className="sr-only">Email</label>
                            <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email Address" required className={`w-full px-4 py-2.5 rounded-lg bg-[${THEME_BG_SECONDARY}] border border-[${THEME_BORDER_PRIMARY}] focus:ring-[${THEME_YELLOW_PRIMARY}] focus:border-[${THEME_YELLOW_PRIMARY}] text-[${THEME_TEXT_ON_DARK_PRIMARY}] placeholder:text-[${THEME_TEXT_ON_DARK_SECONDARY}]`} />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">Password</label>
                            <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required className={`w-full px-4 py-2.5 rounded-lg bg-[${THEME_BG_SECONDARY}] border border-[${THEME_BORDER_PRIMARY}] focus:ring-[${THEME_YELLOW_PRIMARY}] focus:border-[${THEME_YELLOW_PRIMARY}] text-[${THEME_TEXT_ON_DARK_PRIMARY}] placeholder:text-[${THEME_TEXT_ON_DARK_SECONDARY}]`} />
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <button type="submit" disabled={loading} className={`w-full bg-[${THEME_YELLOW_PRIMARY}] text-[${THEME_YELLOW_BUTTON_TEXT}] px-5 py-2.5 rounded-full text-md font-semibold hover:opacity-90 transition-opacity shadow-md disabled:opacity-50`}>Sign In with Email</button>
                             <button onClick={handleEmailSignUp} type="button"  disabled={loading} className={`w-full bg-transparent text-[${THEME_TEXT_ON_DARK_PRIMARY}] border border-[${THEME_YELLOW_PRIMARY}] px-5 py-2.5 rounded-full text-md font-semibold hover:bg-[${THEME_YELLOW_PRIMARY}]/10 transition-colors shadow-md disabled:opacity-50`}>Sign Up with Email</button>
                        </div>
                    </form>
                    <div className="flex items-center my-4">
                        <hr className={`flex-grow border-[${THEME_BORDER_PRIMARY}]`} />
                        <span className={`px-3 text-sm text-[${THEME_TEXT_ON_DARK_SECONDARY}]`}>OR</span>
                        <hr className={`flex-grow border-[${THEME_BORDER_PRIMARY}]`} />
                    </div>
                    <button onClick={handleGoogleSignIn} disabled={loading} className={`w-full flex items-center justify-center gap-3 bg-white text-gray-700 px-6 py-3 rounded-full text-lg font-medium hover:bg-gray-100 transition-colors shadow-lg border border-gray-300 disabled:opacity-50`} > <GoogleIcon /> Sign In with Google </button>
                </div>
            )}
        </div>
    </div>
  );
};

type CreatePageSection = 'menu' | 'createChannelForm' | 'uploadVideo' | 'createShort' | 'editProfile';

export const CreatePage: React.FC<PageProps> = ({ navigateTo, context, currentUser }) => {
  const [userChannel, setUserChannel] = useState<Channel | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false); // For specific actions like creating channel, uploading
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<CreatePageSection>('createChannelForm');

  // Create Channel Form
  const [newChannelName, setNewChannelName] = useState('');

  // Edit Profile Form
  const [editChannelName, setEditChannelName] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [avatarUploadProgress, setAvatarUploadProgress] = useState(0);
  const [bannerUploadProgress, setBannerUploadProgress] = useState(0);

  // Upload Video Form
  const [videoTitle, setVideoTitle] = useState('');
  const [videoDescription, setVideoDescription] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [videoFilePreviewName, setVideoFilePreviewName] = useState<string | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [videoUploadProgress, setVideoUploadProgress] = useState(0);
  const [thumbnailUploadProgress, setThumbnailUploadProgress] = useState(0);

  // Create Short Form
  const [shortFile, setShortFile] = useState<File | null>(null);
  const [shortTitle, setShortTitle] = useState('');
  const [shortFilePreviewName, setShortFilePreviewName] = useState<string | null>(null);
  const [shortUploadProgress, setShortUploadProgress] = useState(0);


  const pageTheme = PAGE_THEMES['create'];

  const resetFormStates = (section?: CreatePageSection) => {
    setError(null); // Clear general error on section change
    if (section === 'uploadVideo' || !section) {
        setVideoTitle(''); setVideoDescription(''); setVideoFile(null); setThumbnailFile(null);
        setVideoFilePreviewName(null); setThumbnailPreview(null); setVideoUploadProgress(0); setThumbnailUploadProgress(0);
    }
    if (section === 'createShort' || !section) {
        setShortFile(null); setShortTitle(''); setShortFilePreviewName(null); setShortUploadProgress(0);
    }
    if (section === 'editProfile' || !section) {
        setEditChannelName(userChannel?.name || ''); setAvatarFile(null); setBannerFile(null);
        setAvatarPreview(userChannel?.avatarUrl || null); setBannerPreview(userChannel?.bannerUrl || null);
        setAvatarUploadProgress(0); setBannerUploadProgress(0);
    }
    if (section === 'createChannelForm' || !section) {
        setNewChannelName('');
    }
  };

  const switchSection = (section: CreatePageSection) => {
    resetFormStates(section); // Reset the target section's form
    setActiveSection(section);
  };


  useEffect(() => {
    if (!currentUser) {
      navigateTo('auth', { intendedPage: 'create', intendedContext: context });
      return;
    }
    setLoading(true);
    firestoreService.getUserChannel(currentUser.uid)
      .then(channel => {
        setUserChannel(channel);
        if (channel) {
          switchSection('menu'); // Go to menu if channel exists
          setEditChannelName(channel.name);
          setAvatarPreview(channel.avatarUrl);
          setBannerPreview(channel.bannerUrl || null);
        } else {
          switchSection('createChannelForm'); // Go to create form if not
        }
      })
      .catch(err => {
        console.error("Error fetching user channel:", err);
        setError("Could not check for existing channel.");
        switchSection('createChannelForm'); // Fallback to create form on error
      })
      .finally(() => setLoading(false));
  }, [currentUser, navigateTo, context]); 

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setFile: React.Dispatch<React.SetStateAction<File | null>>,
    setPreview?: React.Dispatch<React.SetStateAction<string | null>>,
    setFileNamePreview?: React.Dispatch<React.SetStateAction<string | null>>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setFile(file);
      if (setPreview) {
        const reader = new FileReader();
        reader.onloadend = () => setPreview(reader.result as string);
        reader.readAsDataURL(file);
      }
      if (setFileNamePreview) {
        setFileNamePreview(file.name);
      }
    } else {
      setFile(null);
      if (setPreview) setPreview(null);
      if (setFileNamePreview) setFileNamePreview(null);
    }
  };

  const handleCreateChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChannelName.trim() || !currentUser) return;
    setActionLoading(true); setError(null);
    try {
      const newChannelId = await firestoreService.createChannel(currentUser.uid, newChannelName.trim());
      const newChannel = await firestoreService.getChannelDetails(newChannelId);
      setUserChannel(newChannel);
      alert(`Channel "${newChannelName.trim()}" created!`);
      setNewChannelName(''); // Reset form
      switchSection('menu');
    } catch (err: any) {
      setError(err.message || "Failed to create channel.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userChannel || !currentUser) return;
    setActionLoading(true); setError(null);
    setAvatarUploadProgress(0); setBannerUploadProgress(0);
    try {
      let newAvatarUrl = userChannel.avatarUrl;
      let newBannerUrl = userChannel.bannerUrl;

      if (avatarFile) {
        newAvatarUrl = await uploadFileToStorage(avatarFile, `avatars/${userChannel.id}/${avatarFile.name}`, setAvatarUploadProgress);
      }
      if (bannerFile) {
        newBannerUrl = await uploadFileToStorage(bannerFile, `banners/${userChannel.id}/${bannerFile.name}`, setBannerUploadProgress);
      }
      
      await firestoreService.updateChannelDetails(userChannel.id, {
        name: editChannelName || userChannel.name,
        avatarUrl: newAvatarUrl,
        bannerUrl: newBannerUrl,
      });

      // Update local state
      const updatedChannel = await firestoreService.getChannelDetails(userChannel.id);
      setUserChannel(updatedChannel);
      if(updatedChannel) {
        setEditChannelName(updatedChannel.name);
        setAvatarPreview(updatedChannel.avatarUrl);
        setBannerPreview(updatedChannel.bannerUrl || null);
      }
      setAvatarFile(null); setBannerFile(null); // Clear file inputs
      alert("Channel profile updated successfully!");
      switchSection('menu');
    } catch (err: any) {
      setError(err.message || "Failed to update profile.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUploadVideo = async (e: React.FormEvent, isShort: boolean) => {
    e.preventDefault();
    const currentFile = isShort ? shortFile : videoFile;
    const currentTitle = isShort ? shortTitle : videoTitle;
    const currentDescription = isShort ? '' : videoDescription; // Shorts typically don't have long descriptions
    const setProgress = isShort ? setShortUploadProgress : setVideoUploadProgress;
    const setThumbProgress = isShort ? () => {} : setThumbnailUploadProgress;


    if (!currentFile || !userChannel || !currentUser) {
        setError("Missing video file or channel information.");
        return;
    }
    if (!isShort && !currentTitle.trim()){
        setError("Video title is required.");
        return;
    }


    setActionLoading(true); setError(null);
    setProgress(0); setThumbProgress(0);

    try {
      const videoUrl = await uploadFileToStorage(currentFile, `videos/${userChannel.id}/${Date.now()}_${currentFile.name}`, setProgress);
      let thumbnailUrl = '';
      if (!isShort && thumbnailFile) {
        thumbnailUrl = await uploadFileToStorage(thumbnailFile, `thumbnails/${userChannel.id}/${Date.now()}_${thumbnailFile.name}`, setThumbProgress);
      } else if (!isShort && !thumbnailFile) {
        // Potentially generate thumbnail from video on server or use placeholder
        thumbnailUrl = PLACEHOLDER_THUMBNAIL; 
      }


      const duration = await getVideoDurationFromFile(currentFile);
      
      const videoData = {
        title: currentTitle.trim(),
        description: currentDescription.trim(),
        videoUrl,
        thumbnailUrl: isShort ? (thumbnailUrl || videoUrl) : (thumbnailUrl || PLACEHOLDER_THUMBNAIL), // For shorts, thumbnail can be same as video or specific.
        channelId: userChannel.id,
        channelName: userChannel.name,
        channelAvatarUrl: userChannel.avatarUrl,
        duration,
        uploadDate: Timestamp.now(), // Firebase Timestamp
        isShort,
        // views, likes, dislikes will be defaulted by firestoreService.addVideoMetadata
      };

      const newVideoId = await firestoreService.addVideoMetadata(videoData);
      alert(`${isShort ? 'Short' : 'Video'} uploaded successfully!`);
      
      // Reset specific form and go to menu
      if (isShort) {
        setShortFile(null); setShortTitle(''); setShortFilePreviewName(null);
      } else {
        setVideoTitle(''); setVideoDescription(''); setVideoFile(null); setThumbnailFile(null);
        setVideoFilePreviewName(null); setThumbnailPreview(null);
      }
      // Refresh user channel data to reflect new video count
      const updatedChannel = await firestoreService.getChannelDetails(userChannel.id);
      setUserChannel(updatedChannel);
      switchSection('menu');
      navigateTo('video', { videoId: newVideoId });

    } catch (err: any) {
      console.error("Upload error:", err);
      setError(err.message || `Failed to upload ${isShort ? 'short' : 'video'}.`);
    } finally {
      setActionLoading(false);
    }
  };


  if (loading) return <div className="flex-grow flex items-center justify-center"><LoadingSpinner /></div>;
  
  const commonInputClass = `w-full px-4 py-2.5 rounded-lg bg-[${THEME_BG_SECONDARY}] border border-[${THEME_BORDER_PRIMARY}] focus:ring-[${THEME_YELLOW_PRIMARY}] focus:border-[${THEME_YELLOW_PRIMARY}] text-[${THEME_TEXT_ON_DARK_PRIMARY}] placeholder:text-[${THEME_TEXT_ON_DARK_SECONDARY}]`;
  const commonButtonClass = `w-full bg-[${THEME_YELLOW_PRIMARY}] text-[${THEME_YELLOW_BUTTON_TEXT}] px-6 py-3 rounded-full text-lg font-bold hover:opacity-90 transition-opacity shadow-lg disabled:opacity-50`;
  const fileInputClass = "block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-yellow-100 file:text-yellow-700 hover:file:bg-yellow-200";
  
  const renderBackButton = (targetSection: CreatePageSection = 'menu') => (
      <button type="button" onClick={() => switchSection(targetSection)} className={`mb-4 text-[${THEME_YELLOW_PRIMARY}] hover:underline`}>
          &larr; Back to Menu
      </button>
  );

  return (
    <div className={`flex-grow flex flex-col text-[${THEME_TEXT_ON_DARK_PRIMARY}]`}>
      <header className="sticky top-0 z-10 w-full backdrop-blur-sm h-[71px]" style={{backgroundColor: `${pageTheme.statusBarColor}CC`}}>
        <div className="flex items-center p-4 md:px-6 lg:px-8 pb-3 justify-between">
          <button onClick={() => {
              if (activeSection !== 'menu' && activeSection !== 'createChannelForm' && userChannel) {
                  switchSection('menu');
              } else {
                  navigateTo(context?.previousPageId || 'home', {isBackNavigation: true});
              }
          }} 
          className={`text-[${THEME_TEXT_ON_DARK_PRIMARY}] flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-[${THEME_BG_TERTIARY_HOVER}] transition-colors`}>
            <BackIcon />
          </button>
          <h1 className="text-xl font-bold leading-tight tracking-tight flex-1 text-center pr-10">
            {activeSection === 'createChannelForm' && 'Create Your Channel'}
            {activeSection === 'menu' && (userChannel?.name || 'Your Channel Hub')}
            {activeSection === 'uploadVideo' && 'Upload Video'}
            {activeSection === 'createShort' && 'Create Short'}
            {activeSection === 'editProfile' && 'Edit Channel Profile'}
          </h1>
        </div>
      </header>

      <main className={`flex-grow flex flex-col items-center p-6 space-y-6 overflow-y-auto custom-scrollbar ${FOOTER_HEIGHT_RESPONSIVE_PADDING}`}>
        {error && <ErrorMessage message={error} />}
        {actionLoading && <div className="my-4"><LoadingSpinner /></div>}

        {activeSection === 'createChannelForm' && !actionLoading && (
          <form onSubmit={handleCreateChannel} className="w-full max-w-md space-y-6">
            <h2 className="text-3xl font-bold text-center">Create Your Channel</h2>
            <div>
              <label htmlFor="newChannelName" className={`block text-sm font-medium text-[${THEME_TEXT_ON_DARK_SECONDARY}] mb-1`}>Channel Name</label>
              <input type="text" id="newChannelName" value={newChannelName} onChange={(e) => setNewChannelName(e.target.value)} placeholder="Enter channel name" required className={commonInputClass} />
            </div>
            <button type="submit" disabled={!newChannelName.trim()} className={commonButtonClass}>Create Channel</button>
          </form>
        )}

        {activeSection === 'menu' && userChannel && !actionLoading && (
          <div className="w-full max-w-md space-y-4 text-center">
            <img src={userChannel.avatarUrl || PLACEHOLDER_AVATAR} alt={userChannel.name} className="size-24 rounded-full mx-auto ring-2 ring-yellow-400"/>
            <h2 className="text-2xl font-semibold">Welcome, {userChannel.name}!</h2>
            <p className={`text-[${THEME_TEXT_ON_DARK_SECONDARY}]`}>Videos: {userChannel.videoCount} | Subscribers: {formatViews(userChannel.subscribersCount)}</p>
            <button onClick={() => switchSection('uploadVideo')} className={commonButtonClass}>Upload Video</button>
            <button onClick={() => switchSection('createShort')} className={commonButtonClass}>Create Short</button>
            <button onClick={() => switchSection('editProfile')} className={commonButtonClass}>Edit Channel Profile</button>
             <button onClick={() => navigateTo('channel', {channelId: userChannel.id})} className={`${commonButtonClass} bg-gray-600 hover:bg-gray-500`}>View My Channel</button>
          </div>
        )}

        {activeSection === 'editProfile' && userChannel && !actionLoading && (
          <form onSubmit={handleEditProfile} className="w-full max-w-md space-y-4">
            {renderBackButton()}
            <h2 className="text-2xl font-semibold text-center">Edit Profile</h2>
            <div>
              <label htmlFor="editChannelName" className="block text-sm font-medium">Channel Name</label>
              <input type="text" id="editChannelName" value={editChannelName} onChange={(e) => setEditChannelName(e.target.value)} className={commonInputClass} />
            </div>
            <div>
              <label htmlFor="avatarFile" className="block text-sm font-medium">Channel Avatar</label>
              {avatarPreview && <img src={avatarPreview} alt="Avatar Preview" className="size-24 rounded-full my-2 mx-auto"/>}
              <input type="file" id="avatarFile" accept="image/*" onChange={(e) => handleFileChange(e, setAvatarFile, setAvatarPreview)} className={fileInputClass}/>
              {avatarUploadProgress > 0 && <p>Avatar Upload: {avatarUploadProgress.toFixed(0)}%</p>}
            </div>
            <div>
              <label htmlFor="bannerFile" className="block text-sm font-medium">Channel Banner</label>
              {bannerPreview && <img src={bannerPreview} alt="Banner Preview" className="w-full h-32 object-cover my-2 rounded"/>}
              <input type="file" id="bannerFile" accept="image/*" onChange={(e) => handleFileChange(e, setBannerFile, setBannerPreview)} className={fileInputClass}/>
              {bannerUploadProgress > 0 && <p>Banner Upload: {bannerUploadProgress.toFixed(0)}%</p>}
            </div>
            <button type="submit" className={commonButtonClass}>Save Changes</button>
          </form>
        )}
        
        {activeSection === 'uploadVideo' && userChannel && !actionLoading && (
            <form onSubmit={(e) => handleUploadVideo(e, false)} className="w-full max-w-md space-y-4">
                {renderBackButton()}
                <h2 className="text-2xl font-semibold text-center">Upload Video</h2>
                <div>
                    <label htmlFor="videoTitle" className="block text-sm font-medium">Title</label>
                    <input type="text" id="videoTitle" value={videoTitle} onChange={(e) => setVideoTitle(e.target.value)} required className={commonInputClass} />
                </div>
                <div>
                    <label htmlFor="videoDescription" className="block text-sm font-medium">Description</label>
                    <textarea id="videoDescription" value={videoDescription} onChange={(e) => setVideoDescription(e.target.value)} rows={3} className={commonInputClass}></textarea>
                </div>
                <div>
                    <label htmlFor="videoFile" className="block text-sm font-medium">Video File</label>
                    <input type="file" id="videoFile" accept="video/*" required onChange={(e) => handleFileChange(e, setVideoFile, undefined, setVideoFilePreviewName)} className={fileInputClass}/>
                    {videoFilePreviewName && <p className="text-xs mt-1">Selected: {videoFilePreviewName}</p>}
                    {videoUploadProgress > 0 && <p>Video Upload: {videoUploadProgress.toFixed(0)}%</p>}
                </div>
                <div>
                    <label htmlFor="thumbnailFile" className="block text-sm font-medium">Thumbnail (Optional)</label>
                    {thumbnailPreview && <img src={thumbnailPreview} alt="Thumbnail Preview" className="w-full aspect-video object-cover my-2 rounded"/>}
                    <input type="file" id="thumbnailFile" accept="image/*" onChange={(e) => handleFileChange(e, setThumbnailFile, setThumbnailPreview)} className={fileInputClass}/>
                    {thumbnailUploadProgress > 0 && thumbnailFile && <p>Thumbnail Upload: {thumbnailUploadProgress.toFixed(0)}%</p>}
                </div>
                <button type="submit" disabled={!videoFile || !videoTitle.trim()} className={commonButtonClass}>Upload Video</button>
            </form>
        )}

        {activeSection === 'createShort' && userChannel && !actionLoading && (
            <form onSubmit={(e) => handleUploadVideo(e, true)} className="w-full max-w-md space-y-4">
                {renderBackButton()}
                <h2 className="text-2xl font-semibold text-center">Create Short</h2>
                 <div>
                    <label htmlFor="shortTitle" className="block text-sm font-medium">Caption (Optional)</label>
                    <input type="text" id="shortTitle" value={shortTitle} onChange={(e) => setShortTitle(e.target.value)} className={commonInputClass} />
                </div>
                <div>
                    <label htmlFor="shortFile" className="block text-sm font-medium">Short Video File</label>
                    <input type="file" id="shortFile" accept="video/*" required onChange={(e) => handleFileChange(e, setShortFile, undefined, setShortFilePreviewName)} className={fileInputClass}/>
                    {shortFilePreviewName && <p className="text-xs mt-1">Selected: {shortFilePreviewName}</p>}
                    {shortUploadProgress > 0 && <p>Short Upload: {shortUploadProgress.toFixed(0)}%</p>}
                </div>
                <button type="submit" disabled={!shortFile} className={commonButtonClass}>Create Short</button>
            </form>
        )}

      </main>
    </div>
  );
};


export const PlaceholderPage: React.FC<{ title: string; navigateTo: (page: PageId, context?: PageContext) => void; context?: PageContext; currentUser: User | null }> = ({ title, navigateTo, context, currentUser }) => (
  <div className={`flex-grow flex flex-col text-[${THEME_TEXT_ON_DARK_PRIMARY}]`}>
     <header className="sticky top-0 z-10 w-full h-[60px]" style={{backgroundColor: `${PAGE_THEMES[context?.previousPageId || 'home'].statusBarColor}CC`}}>
        <div className="flex items-center p-4 md:px-6 lg:px-8 pb-3 justify-start">
            <button onClick={() => navigateTo(context?.previousPageId || 'home', {isBackNavigation: true})} className={`text-[${THEME_TEXT_ON_DARK_PRIMARY}] flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-[${THEME_BG_TERTIARY_HOVER}] transition-colors`}>
                <BackIcon />
            </button>
             <h1 className="text-xl font-bold leading-tight tracking-tight flex-1 text-center pr-10">{title}</h1>
        </div>
    </header>
    <div className={`flex-grow flex items-center justify-center ${FOOTER_HEIGHT_RESPONSIVE_PADDING}`}>
      <h1 className="text-3xl font-bold">{title} (Coming Soon)</h1>
    </div>
    { title === "Login" && 
      <div className={`p-4 text-center ${FOOTER_HEIGHT_RESPONSIVE_PADDING}`}>
        <p className={`text-[${THEME_TEXT_ON_DARK_SECONDARY}]`}>User authentication is a planned feature.</p>
      </div>
    }
  </div>
);