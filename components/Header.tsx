"use client"
import Link from 'next/link';
import { SITE_NAME, SITE_SUBTITLE } from '../lib/constants';
import { Button } from './ui/button';
import { useSearchModal } from '../lib/hooks/useSearchModal';
import { SearchIcon } from 'lucide-react';

export default function Header() {
  const { open } = useSearchModal();

  return (
    <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Link href="/" className="flex flex-col">
              <span className="text-xl font-bold text-gray-900">{SITE_NAME}</span>
              <span className="text-xs text-gray-500">{SITE_SUBTITLE}</span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={open}
              aria-label="搜索地名"
              className="hover:bg-gray-100"
            >
              <SearchIcon className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
