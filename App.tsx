
import React, { useState, useEffect, useCallback } from 'react';
import { PageId, PageContext, User } from './types';
import { HomePage, SearchPage, VideoPage, LibraryPage, ChannelPage, ShortsPage, PlaceholderPage, AuthPage, CreatePage } from './pages';
// FIX: Import LoadingSpinner
import { HomeIcon, CreateIcon as NavCreateIcon, SubscriptionsIcon, LibraryIcon, UserIcon, LoadingSpinner } from './components';
import { onAuthStateChanged, initializeFirebase } from './firebase'; // Import initializeFirebase
import {
    DEFAULT_PAGE, PAGE_THEMES,
    THEME_YELLOW_PRIMARY, THEME_TEXT_ON_DARK_SECONDARY,
    THEME_BG_PRIMARY, THEME_BORDER_PRIMARY,
    THEME_BG_SECONDARY, THEME_BG_TERTIARY_HOVER,
    THEME_TEXT_ON_DARK_PRIMARY
} from './constants';
import { ShortsIcon as StreamrShortsIcon } from './components';


const StatusBarFill: React.FC<{ currentPage: PageId }> = ({ currentPage }) => {
  const [bgColor, setBgColor] = useState(PAGE_THEMES[DEFAULT_PAGE].statusBarColor);

  useEffect(() => {
    const theme = PAGE_THEMES[currentPage] || PAGE_THEMES[DEFAULT_PAGE];
    setBgColor(theme.statusBarColor);
    document.body.style.backgroundColor = theme.bodyBgColor;
  }, [currentPage]);

  return <div style={{ backgroundColor: bgColor }} className="h-[env(safe-area-inset-top)] sticky top-0 z-[100]"></div>;
};

interface NavLinkProps {
  page: PageId;
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  navigateTo: (page: PageId, context?: PageContext) => void;
  activeColorClass?: string;
  inactiveColorClass?: string;
  hoverBgClass?: string;
  activeFontWeight?: string;
  inactiveFontWeight?: string;
}

const NavLink: React.FC<NavLinkProps> = ({
    page, label, icon, isActive, navigateTo,
    activeColorClass = `text-[${THEME_YELLOW_PRIMARY}]`,
    inactiveColorClass = `text-[${THEME_TEXT_ON_DARK_SECONDARY}]`,
    hoverBgClass = `hover:bg-[${THEME_BG_TERTIARY_HOVER}] active:bg-[${THEME_BG_SECONDARY}]`,
    activeFontWeight = 'font-bold',
    inactiveFontWeight = 'font-medium'
}) => (
  <button
    onClick={() => navigateTo(page)}
    className={`flex flex-1 flex-col items-center justify-end gap-0.5 rounded-lg py-1 transition-colors duration-150
      ${isActive ? activeColorClass : inactiveColorClass}
      ${hoverBgClass}`}
    aria-current={isActive ? 'page' : undefined}
  >
    <div className={`flex size-7 items-center justify-center ${isActive ? activeColorClass : inactiveColorClass}`}>
      {icon}
    </div>
    <p className={`text-xs leading-normal tracking-[0.015em] ${isActive ? activeFontWeight : inactiveFontWeight}`}>{label}</p>
  </button>
);


const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<PageId>(DEFAULT_PAGE);
  const [pageContext, setPageContext] = useState<PageContext | undefined>(undefined);
  const [historyStack, setHistoryStack] = useState<Array<{page: PageId, context?: PageContext}>>([{ page: DEFAULT_PAGE }]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authInitialized, setAuthInitialized] = useState(false);

  useEffect(() => {
    // initializeFirebase(); // Already called in index.tsx
    const unsubscribe = onAuthStateChanged((user: any) => { // firebase.User
      if (user) {
        setCurrentUser({
          uid: user.uid,
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
        });
      } else {
        setCurrentUser(null);
      }
      if (!authInitialized) {
        setAuthInitialized(true);
      }
    });
    return () => unsubscribe(); // Cleanup subscription
  }, [authInitialized]);


  const navigateTo = useCallback((page: PageId, context?: PageContext) => {
    window.scrollTo(0,0);

    let effectivePage = page;
    let effectiveContext = { ...context };

    // Auth guard for pages requiring login
    const requiresAuth = ['create', 'library']; // Add other pages as needed
    if (requiresAuth.includes(effectivePage) && !currentUser && authInitialized) {
        effectiveContext = {
            ...context,
            intendedPage: effectivePage,
            intendedContext: context,
            previousPageId: currentPage,
        };
        effectivePage = 'auth';
    }

    const newNavigationEntry = { page: effectivePage, context: { ...effectiveContext, previousPageId: currentPage } };

    if (effectiveContext?.isBackNavigation && historyStack.length > 1) {
        const previousEntry = historyStack[historyStack.length - 2];
        setCurrentPage(previousEntry.page);
        setPageContext(previousEntry.context);
        setHistoryStack(prev => prev.slice(0, -1));
    } else {
        setCurrentPage(effectivePage);
        setPageContext({ ...newNavigationEntry.context });
        // Prevent pushing duplicate 'auth' page if already on it and trying to go to auth again
        if (effectivePage === 'auth' && currentPage === 'auth' && historyStack[historyStack.length-1]?.page === 'auth') {
            // Update context of current auth page if needed
            setHistoryStack(prev => {
                const newStack = [...prev];
                newStack[newStack.length -1] = newNavigationEntry;
                return newStack;
            });
        } else {
            setHistoryStack(prev => [...prev, newNavigationEntry]);
        }
    }
  }, [currentPage, currentUser, historyStack, authInitialized]);


  const renderPage = () => {
    if (!authInitialized && (currentPage === 'create' || currentPage === 'library' || currentPage === 'auth')) {
        // Show a global loading spinner or minimal UI until auth is initialized
        return <div className="flex-grow flex items-center justify-center"><HomeIcon className="animate-pulse text-4xl" /></div>;
    }

    const currentHistoryEntry = historyStack[historyStack.length - 1];
    // Ensure pageContext for the page always includes the latest currentUser
    const props = { 
        navigateTo, 
        context: { 
            ...currentHistoryEntry.context, 
            previousPageId: historyStack.length > 1 ? historyStack[historyStack.length - 2].page : undefined 
        },
        currentUser 
    };

    switch (currentHistoryEntry.page) {
      case 'home': return <HomePage {...props} />;
      case 'search': return <SearchPage {...props} />;
      case 'video': return <VideoPage {...props} />;
      case 'library': return currentUser ? <LibraryPage {...props} /> : <AuthPage {...props} />; // Should be guarded by navigateTo
      case 'channel': return <ChannelPage {...props} />;
      case 'shorts': return <ShortsPage {...props} />;
      case 'create': return currentUser ? <CreatePage {...props} /> : <AuthPage {...props} />; // Should be guarded by navigateTo
      case 'auth': return <AuthPage {...props} />;
      case 'subscriptions': return <PlaceholderPage title="Subscriptions" {...props} />;
      default: return <HomePage {...props} />;
    }
  };

  const renderFooter = () => {
    if (currentPage === 'shorts') {
      return null;
    }
    if (currentPage === 'video') {
        return <div className={`h-[env(safe-area-inset-bottom)]`} style={{backgroundColor: PAGE_THEMES['video'].bodyBgColor}}></div>;
    }

    let footerBg = `bg-[${THEME_BG_PRIMARY}]`;
    let borderColor = `border-[${THEME_BORDER_PRIMARY}]`;
    let activeColor = `text-[${THEME_YELLOW_PRIMARY}]`;
    let inactiveColor = `text-[${THEME_TEXT_ON_DARK_SECONDARY}]`;
    let hoverBg = `hover:bg-[${THEME_BG_TERTIARY_HOVER}] active:bg-[${THEME_BG_SECONDARY}]`;
    let navBarFillBg = `bg-[${THEME_BG_PRIMARY}]`;

    const pageSpecificTheme = PAGE_THEMES[currentPage] || PAGE_THEMES[DEFAULT_PAGE];

    footerBg = `bg-[${pageSpecificTheme.bodyBgColor}]/95 backdrop-blur-sm`;
    navBarFillBg = `bg-[${pageSpecificTheme.bodyBgColor}]/95 backdrop-blur-sm`;

    if (currentPage === 'search') {
        borderColor = `border-[${THEME_BORDER_PRIMARY}]`;
        inactiveColor = `text-[${THEME_TEXT_ON_DARK_PRIMARY}]/80`;
        hoverBg = `hover:text-[${THEME_YELLOW_PRIMARY}] hover:bg-[${THEME_YELLOW_PRIMARY}]/10`;
    } else if (currentPage === 'library' || currentPage === 'channel' || currentPage === 'auth' || currentPage === 'create') {
        borderColor = `border-[${THEME_BORDER_PRIMARY}]`;
        hoverBg = `hover:text-[${THEME_YELLOW_PRIMARY}] hover:bg-[${THEME_BG_TERTIARY_HOVER}]`;
    }


    const navItemsBase = [
      { page: 'home' as PageId, label: 'Home', icon: <HomeIcon isFilled={currentPage === 'home'} /> },
      { page: 'shorts' as PageId, label: 'Shorts', icon: <StreamrShortsIcon /> },
      { page: 'create' as PageId, label: 'Create', icon: <NavCreateIcon /> }, // NavCreateIcon is the original CreateIcon
      { page: 'subscriptions' as PageId, label: 'Subscriptions', icon: <SubscriptionsIcon isFilled={currentPage === 'subscriptions'} /> },
    ];

    const profileOrLibraryNavItem = currentUser
      ? { page: 'library' as PageId, label: 'Library', icon: <LibraryIcon isFilled={currentPage === 'library'} /> }
      : { page: 'auth' as PageId, label: 'Login', icon: <UserIcon isFilled={currentPage === 'auth'} /> };

    const navItems = [...navItemsBase, profileOrLibraryNavItem];

    return (
      <div className="sticky bottom-0 z-20">
        <div className={`flex gap-1 sm:gap-2 border-t ${borderColor} ${footerBg} px-2 sm:px-4 pb-3 pt-2`}> {/* Adjusted gaps and padding */}
          {navItems.map(item => (
            <NavLink
              key={item.page}
              page={item.page}
              label={item.label}
              icon={item.icon}
              isActive={currentPage === item.page}
              navigateTo={navigateTo}
              activeColorClass={activeColor}
              inactiveColorClass={inactiveColor}
              hoverBgClass={hoverBg}
            />
          ))}
        </div>
        <div className={`h-[env(safe-area-inset-bottom)] ${navBarFillBg}`}></div>
      </div>
    );
  };
  
  if (!authInitialized && (['create', 'library', 'auth'].includes(currentPage))) {
      return (
          <>
              <StatusBarFill currentPage={DEFAULT_PAGE} />
              <div className="flex-grow flex items-center justify-center bg-black">
                  <LoadingSpinner/>
              </div>
          </>
      );
  }


  return (
    <>
      <StatusBarFill currentPage={currentPage} />
      <div className="flex-grow flex flex-col overflow-hidden">
        {renderPage()}
      </div>
      {renderFooter()}
    </>
  );
};

export default App;