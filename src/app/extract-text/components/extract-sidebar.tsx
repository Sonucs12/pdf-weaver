'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Plus, FileEdit, Save, LucideIcon } from 'lucide-react';
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
    icon: Save,
  },
];

export function ExtractSidebar() {
  const pathname = usePathname();


  return (
    <aside className="w-64 border-r border-border bg-background flex flex-col">
      <nav className="flex-1 p-4">
      {menuItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={clsx(
              "flex items-center px-4 py-2 mt-2 text-sm  rounded-lg  transition-all duration-300",
              {
                "bg-sidebar-active text-sidebar-text": pathname === item.href,
                "hover:bg-grey-background": pathname !== item.href,
              }
            )}
          >
            <item.icon className="h-4 w-4" />
            <span className="ml-3  ">{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}