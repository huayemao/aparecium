"use client"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { useSearchModal } from '../lib/hooks/useSearchModal';
import { useState, useEffect, useCallback } from 'react';
import { Area } from '@prisma/client';
import Link from 'next/link';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { SearchIcon, XIcon } from 'lucide-react';

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Search Modal Component
export default function SearchModal() {
  const { isOpen, close } = useSearchModal();
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<Area[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Fetch search results
  const fetchResults = useCallback(async (term: string) => {
    if (!term.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/search?query=${encodeURIComponent(term)}`);
      const data = await response.json();
      setResults(data.results || []);
      setFocusedIndex(-1);
    } catch (error) {
      console.error('Error fetching search results:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Effect to fetch results when debounced search term changes
  useEffect(() => {
    fetchResults(debouncedSearchTerm);
  }, [debouncedSearchTerm, fetchResults]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setFocusedIndex(prev => 
          prev < results.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setFocusedIndex(prev => 
          prev > 0 ? prev - 1 : results.length - 1
        );
      } else if (e.key === 'Enter' && focusedIndex >= 0) {
        e.preventDefault();
        const selectedResult = results[focusedIndex];
        if (selectedResult) {
          // Construct the path based on the area ID
          const path = constructPath(selectedResult.id);
          window.location.href = path;
        }
      } else if (e.key === 'Escape') {
        close();
      }
    },
    [results, focusedIndex, close]
  );

  // Construct path for the area
  const constructPath = (id: string): string => {
    // This is a simplified version - in a real app, you might want to fetch the full path
    // For now, we'll use a heuristic based on the ID length
    if (id.endsWith('0000000000')) {
      // Province level
      return `/provinces/${id.substring(0, 2)}`;
    } else if (id.endsWith('00000000')) {
      // City level
      return `/provinces/${id.substring(0, 2)}/${id}`;
    } else if (id.endsWith('000000')) {
      // County level
      return `/provinces/${id.substring(0, 2)}/${id}`;
    } else if (id.endsWith('000')) {
      // Township level
      return `/provinces/${id.substring(0, 2)}/${id}`;
    } else {
      // Village level
      return `/provinces/${id.substring(0, 2)}/${id}`;
    }
  };

  // Clear search term
  const clearSearch = () => {
    setSearchTerm('');
    setResults([]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={close}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden">
        <DialogHeader className="p-4 border-b">
          <DialogTitle className="text-center">搜索地名</DialogTitle>
        </DialogHeader>
        
        <div className="p-4">
          <div className="relative">
            <Input
              placeholder="输入地名或行政区划代码..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
              className="pl-10 pr-10"
            />
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            {searchTerm && (
              <Button
                variant="ghost"
                size="icon"
                onClick={clearSearch}
                className="absolute right-1 top-1/2 transform -translate-y-1/2"
              >
                <XIcon className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <Separator />

        <ScrollArea className="h-[400px]">
          <div className="p-4">
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-pulse text-gray-500">搜索中...</div>
              </div>
            ) : debouncedSearchTerm && results.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                未找到匹配的地名
              </div>
            ) : results.length > 0 ? (
              <div className="space-y-2">
                {results.map((result, index) => (
                  <Link
                    key={result.id}
                    href={constructPath(result.id)}
                    onClick={close}
                    className={`block p-3 rounded-lg transition-colors ${
                      focusedIndex === index
                        ? 'bg-gray-100 ring-2 ring-gray-300'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="font-medium text-gray-900">{result.name}</div>
                    <div className="text-sm text-gray-500">代码: {result.id}</div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                开始输入以搜索地名
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
