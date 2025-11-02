'use client';

import { ExtractSidebar } from '@/components/layout/extract-sidebar';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex w-full overflow-hidden h-[calc(100vh-4.7rem)]">
      <ExtractSidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
  
}
