'use client';

import { ExtractSidebar } from './components/extract-sidebar';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex md:flex-row flex-col-reverse w-full overflow-hidden h-[calc(100vh-4.7rem)]">
      <ExtractSidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
  
}
