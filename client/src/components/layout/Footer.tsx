import React from "react";
import { Link } from "wouter";

const Footer: React.FC = () => {
  return (
    <footer className="bg-neutral-950 border-t border-neutral-800 py-4">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-neutral-400 text-sm mb-3 md:mb-0">
            © {new Date().getFullYear()} Rocket Casino. All rights reserved.
          </div>
          <div className="flex space-x-4 text-sm">
            {/* Fix: Use Link properly without nesting <a> tags */}
            <Link href="/terms" className="text-neutral-400 hover:text-white">
              Terms
            </Link>
            <Link href="/privacy" className="text-neutral-400 hover:text-white">
              Privacy
            </Link>
            <Link href="/help" className="text-neutral-400 hover:text-white">
              Help
            </Link>
            <Link href="/responsible-gambling" className="text-neutral-400 hover:text-white">
              Responsible Gambling
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
