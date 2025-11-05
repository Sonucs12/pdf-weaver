'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Plus, FileEdit, Save, LucideIcon, PenIcon } from 'lucide-react';
import clsx from "clsx";

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
  {
    href: '/extract-text/editor',
    label: 'Editor',
    icon: PenIcon,
  },
];

// Desktop Sidebar Component
function DesktopSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-border bg-background flex flex-col">
      <nav className="flex-1 p-4">
        {menuItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={clsx(
              "flex items-center px-4 py-2 mt-2 text-sm rounded-lg transition-all duration-300",
              {
                "bg-sidebar-active text-sidebar-text": pathname === item.href,
                "hover:bg-grey-background": pathname !== item.href,
              }
            )}
          >
            <item.icon size={18} />
            <span className="ml-3">{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}

// Mobile Navigation Component
function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="w-full border-t border-border bg-background flex items-center justify-center py-2">
      <div className="h-full flex flex-row items-center overflow-x-auto scrollbar-hidden px-2 gap-4">
        {menuItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={clsx(
              "flex flex-col justify-center items-center px-4 pt-2 text-sm rounded-lg transition-all duration-300 whitespace-nowrap",
              {
                "bg-sidebar-active text-sidebar-text": pathname === item.href,
                "hover:bg-grey-background": pathname !== item.href,
              }
            )}
          >
            <item.icon size={18} />
            <span className="text-[10px]">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}

// Main component that renders both
export function ExtractSidebar() {
  return (
    <>
      {/* Show only on mobile */}
      <div className="md:hidden fixed bottom-0 right-0 w-full z-10">
        <MobileNav />
      </div>
      
      {/* Show only on desktop */}
      <div className="hidden md:flex">
        <DesktopSidebar />
      </div>
    </>
  );
}