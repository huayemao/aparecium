"use client"
import { useContext } from 'react';
import { SearchModalContext, SearchModalProvider, SearchModalContextType } from '../contexts/searchModal';

export { SearchModalProvider, type SearchModalContextType };

export function useSearchModal() {
  const context = useContext(SearchModalContext);
  if (context === undefined) {
    throw new Error('useSearchModal must be used within a SearchModalProvider');
  }
  return context;
}
