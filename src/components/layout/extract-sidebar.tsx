'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Plus, FileEdit, Save } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ExtractSidebar() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === '/extract-text/create-new') {
      return pathname === '/extract-text' || pathname === '/extract-text/create-new';
    }
    return pathname === path;
  };

  return (
    <aside className="w-64 border-r border-border bg-background flex flex-col">
     
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          <li>
            <Link
              href="/extract-text/create-new"
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                isActive('/extract-text/create-new')
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <Plus className="h-4 w-4" />
              <span>Create New</span>
            </Link>
          </li>
          <li>
            <Link
              href="/extract-text/draft"
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                isActive('/extract-text/draft')
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <FileEdit className="h-4 w-4" />
              <span>Draft</span>
            </Link>
          </li>
          <li>
            <Link
              href="/extract-text/saved"
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                isActive('/extract-text/saved')
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <Save className="h-4 w-4" />
              <span>Saved</span>
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
}

