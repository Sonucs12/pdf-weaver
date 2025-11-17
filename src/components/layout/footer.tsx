"use client";

import Link from "next/link";
import { FaGithub } from "react-icons/fa";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-background border-t">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-muted-foreground gap-1 flex flex-col md:flex-row justify-between items-center  ">
            <p>&copy; {currentYear} All rights reserved.</p>
            <p>Made with 💖 by <Link href="https://github.com/Sonucs12" target="_blank" rel="noopener noreferrer" className="text-primary">sonucs12</Link></p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Link
              href="https://github.com/Sonucs12/pdf-weaver"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <FaGithub />
              <span>View on Github</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};