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

export const Navigation = () => {
  const pathname = usePathname();

  return (
    <nav className="hidden md:flex items-center gap-8">
      {navLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
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
