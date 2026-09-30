import React, { createContext, useContext, useState, useEffect } from 'react';

interface NavigationContextType {
  pathname: string;
  navigate: (path: string) => void;
  selectedBlogSlug: string | null;
  setSelectedBlogSlug: (slug: string | null) => void;
}

const NavigationContext = createContext<NavigationContextType>({
  pathname: '/',
  navigate: () => {},
  selectedBlogSlug: null,
  setSelectedBlogSlug: () => {},
});

const extractSlug = (path: string): string | null => {
  if (path.startsWith('/blog/') && path !== '/blog') {
    return path.replace('/blog/', '').replace(/\/$/, '');
  }
  return null;
};

const getInitialPath = (): string => {
  if (typeof window === 'undefined') return '/';
  
  // Smooth migration from legacy hash URLs (e.g. /#/blog/slug -> /blog/slug)
  if (window.location.hash && window.location.hash.startsWith('#/')) {
    const clean = window.location.hash.replace('#', '');
    window.history.replaceState(null, '', clean);
    return clean;
  }
  
  return window.location.pathname || '/';
};

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pathname, setPathname] = useState<string>(getInitialPath);
  const [selectedBlogSlug, setSelectedBlogSlug] = useState<string | null>(() => extractSlug(getInitialPath()));

  useEffect(() => {
    const handlePopState = () => {
      const currentPath = window.location.pathname || '/';
      setPathname(currentPath);
      setSelectedBlogSlug(extractSlug(currentPath));
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    setSelectedBlogSlug(extractSlug(path));
    setPathname(path);
    window.history.pushState(null, '', path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <NavigationContext.Provider value={{ pathname, navigate, selectedBlogSlug, setSelectedBlogSlug }}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => useContext(NavigationContext);

export const usePathname = () => {
  const { pathname } = useContext(NavigationContext);
  return pathname;
};

export const useRouter = () => {
  const { navigate } = useContext(NavigationContext);
  return {
    push: (path: string) => navigate(path),
    replace: (path: string) => {
      window.history.replaceState(null, '', path);
      navigate(path);
    },
    back: () => window.history.back(),
  };
};

interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children: React.ReactNode;
}

export const Link: React.FC<LinkProps> = ({ href, children, onClick, ...props }) => {
  const { navigate } = useContext(NavigationContext);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Allow users to open in new tab with standard keyboard/mouse modifiers
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;

    // External links
    if (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('mailto:')) {
      return;
    }

    e.preventDefault();
    if (onClick) onClick(e);
    navigate(href);
  };

  return (
    <a href={href} onClick={handleClick} {...props}>
      {children}
    </a>
  );
};
