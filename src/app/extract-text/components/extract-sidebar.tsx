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

export function ExtractSidebar() {
  const pathname = usePathname();

  return (
    <aside className="md:w-64 w-full border-r border-border bg-background flex md:flex-col">
      <nav className="md:flex-1 flex flex-row md:flex-col p-4 gap-2 md:gap-0 overflow-x-auto scrollbar-hidden w-full">
        {menuItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={clsx(
              "flex items-center px-4 py-2 md:mt-2 text-sm rounded-lg transition-all duration-300 whitespace-nowrap",
              {
                "bg-sidebar-active text-sidebar-text": pathname === item.href,
                "hover:bg-grey-background": pathname !== item.href,
              }
            )}
          >
            <item.icon className="h-4 w-4" />
            <span className="ml-3">{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}