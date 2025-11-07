'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { Logo } from '@/components/icons';
import { ThemeToggle } from '@/components/theme-toggle';
import { siteConfig } from '@/lib/metadata';
import { Button } from '@/components/ui/button';

import { Navigation } from './navigation';

export const Header = () => {
  const pathname = usePathname();
  const isAppPage = pathname.startsWith('/extract-text');

  return (
    <header className="py-4 px-4 border-b bg-background/80 backdrop-blur-sm sticky top-0 z-20">
      <div className="flex items-center justify-between mx-auto">
        <Link href="/" className="flex items-center gap-2">
          <Logo className="h-7 w-7 text-primary" />
          <h1 className="text-xl font-headline font-bold text-foreground">{siteConfig.name}</h1>
        </Link>
        <Navigation />
        <div className="flex items-center gap-4">
       
          {!isAppPage && (
            <Button asChild className='hidden md:flex'>
              <Link href="/extract-text">
                Launch App <ArrowRight/>
              </Link>
            </Button>
          )}
             <ThemeToggle />
        </div>
      </div>
    </header>
  );
};
