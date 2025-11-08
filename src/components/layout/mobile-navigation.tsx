
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/about', label: 'About' },
  { href: '/contact-us', label: 'Contact' },
  { href: '/disclaimer', label: 'Disclaimer' },
  { href: '/privacy-policy', label: 'Privacy Policy' },
  { href: '/what-is-this', label: 'What is this?' },
];

export const MobileNavigation = ({ closeSidebar }: { closeSidebar: () => void }) => {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-4 p-4">
      {navLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          onClick={closeSidebar}
          className={cn(
            'text-sm font-medium transition-colors hover:text-primary',
            pathname === link.href ? 'text-primary' : 'text-muted-foreground'
          )}
        >
          {link.label}
        </Link>
      ))} 
    </nav>
  );
};
