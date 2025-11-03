'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Plus, FileEdit, Save, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MenuItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const menuItems: MenuItem[] = [
  {
    href: '/extract-text/create-new',
    label: 'Create New',
    icon: Plus,
  },
  {
    href: '/extract-text/draft',
    label: 'Draft',
    icon: FileEdit,
  },
  {
    href: '/extract-text/saved',
    label: 'Saved',
    icon: Save,
  },
];

export function ExtractSidebar() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (pathname === path) return true;
    if (path === '/extract-text/create-new' && pathname === '/extract-text') {
      return true;
    }
    
    return false;
  };

  return (
    <aside className="w-64 border-r border-border bg-background flex flex-col">
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    active
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}