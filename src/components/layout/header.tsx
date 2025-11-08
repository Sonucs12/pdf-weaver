
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowRight, Menu } from 'lucide-react';
import { Logo } from '@/components/icons';
import { ThemeToggle } from '@/components/theme-toggle';
import { siteConfig } from '@/lib/metadata';
import { Button } from '@/components/ui/button';
import { Navigation } from './navigation';
import { Sidebar } from '@/components/ui/mobileSidebar';
import { MobileNavigation } from './mobile-navigation';

export const Header = () => {
  const pathname = usePathname();
  const isAppPage = pathname.startsWith('/extract-text');

  return (
    <header className="md:px-4 px-2 border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="flex h-16 items-center justify-between mx-auto">
        <Link href="/" className="flex items-center gap-2">
          <Logo className="h-7 w-7 text-primary" />
          <h1 className="text-xl font-headline font-bold text-foreground">{siteConfig.name}</h1>
        </Link>
        <Navigation />
        <div className="flex items-center gap-4">
          {!isAppPage && (
            <Button asChild className="hidden md:flex">
              <Link href="/extract-text">
                Launch App <ArrowRight />
              </Link>
            </Button>
          )}
          <ThemeToggle />
          <div className="md:hidden">
            <Sidebar
              trigger={
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Open menu</span>
                </Button>
              }
              headerContent={
                <Link href="/" className="flex items-center gap-2">
                  <Logo className="h-6 w-6 text-primary" />
                  <h1 className="text-lg font-headline font-bold text-foreground">{siteConfig.name}</h1>
                </Link>
              }
            >
              {({ close }) => <MobileNavigation closeSidebar={close} />}
            </Sidebar>
          </div>
        </div>
      </div>
    </header>
  );
};

