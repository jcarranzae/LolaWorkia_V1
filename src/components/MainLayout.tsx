import React from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { usePathname, useNavigation } from '@/context/NavigationContext';

import HomePage from '@/pages/app_pages/page';
import VirtualGalleryPage from '@/pages/app_pages/galeria/page';
import BlogListPage from '@/pages/app_pages/blog/page';
import SingleBlogPostPage from '@/pages/app_pages/blog/[slug]/page';
import ShopPage from '@/pages/app_pages/tienda/page';
import MediaKitPage from '@/pages/app_pages/mediakit/page';
import ContactPage from '@/pages/app_pages/contacto/page';
import BioPage from '@/pages/app_pages/bio/page';
import LoginPage from '@/pages/app_pages/login/page';
import MembersPortalPage from '@/pages/app_pages/miembros/page';
import AdminDashboardPage from '@/pages/app_pages/miembros/admin/page';
import LolaWorkAiToolsView from '@/components/LolaWorkAiToolsView';

export const MainLayout: React.FC = () => {
  const pathname = usePathname();
  const { selectedBlogSlug } = useNavigation();

  const renderCurrentPage = () => {
    if (selectedBlogSlug || (pathname.startsWith('/blog/') && pathname !== '/blog')) {
      return <SingleBlogPostPage slug={selectedBlogSlug || undefined} />;
    }

    switch (pathname) {
      case '/':
        return <HomePage />;
      case '/bio':
      case '/about':
      case '/sobre-mi':
        return <BioPage />;
      case '/galeria':
      case '/gallery':
        return <VirtualGalleryPage />;
      case '/blog':
      case '/magazine':
        return <BlogListPage />;
      case '/tienda':
      case '/shop':
        return <ShopPage />;
      case '/mediakit':
      case '/manifesto':
        return <MediaKitPage />;
      case '/contacto':
      case '/contact':
        return <ContactPage />;
      case '/login':
        return <LoginPage />;
      case '/miembros':
      case '/patronage':
        return <MembersPortalPage />;
      case '/miembros/admin':
        return <AdminDashboardPage />;
      case '/ia-art':
        return <LolaWorkAiToolsView />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-obsidian)', color: 'var(--text-primary)' }}>
      {/* Background Atmosphere Orbs conforming to DESIGN.md §2.1 */}
      <div className="bg-ambient">
        <div className="ambient-orb orb-1" />
        <div className="ambient-orb orb-2" />
        <div className="ambient-orb orb-3" />
      </div>

      {/* Sticky Global Navigation */}
      <Navbar />

      {/* Active View Page */}
      <main style={{ flex: 1, position: 'relative', zIndex: 1 }}>
        {renderCurrentPage()}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default MainLayout;
