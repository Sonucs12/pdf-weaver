
import { siteConfig } from '@/lib/metadata';

export const Footer = () => {
  return (
    <footer className="py-6 border-t">
      <div className="container mx-auto px-4 text-center text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} {siteConfig.name}. All Rights Reserved.</p>
      </div>
    </footer>
  );
};
