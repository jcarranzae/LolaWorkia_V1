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

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pathname, setPathname] = useState<string>('/');
  const [selectedBlogSlug, setSelectedBlogSlug] = useState<string | null>(null);

  useEffect(() => {
    // Handle initial hash or history popstate if needed
    const handlePopState = () => {
      const path = window.location.hash.replace('#', '') || '/';
      setPathname(path);
    };
    handlePopState();
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    // Check if navigating to blog post slug e.g. /blog/some-slug
    if (path.startsWith('/blog/') && path !== '/blog') {
      const slug = path.replace('/blog/', '');
      setSelectedBlogSlug(slug);
    } else {
      setSelectedBlogSlug(null);
    }
    setPathname(path);
    window.location.hash = path;
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
    replace: (path: string) => navigate(path),
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
    e.preventDefault();
    if (onClick) onClick(e);
    navigate(href);
  };

  return (
    <a href={`#${href}`} onClick={handleClick} {...props}>
      {children}
    </a>
  );
};
