"use client"
import { createContext, useState, ReactNode } from 'react';

export interface SearchModalContextType {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

export const SearchModalContext = createContext<SearchModalContextType | undefined>(undefined);

export function SearchModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);
  const toggle = () => setIsOpen(!isOpen);

  return (
    <SearchModalContext.Provider value={{ isOpen, open, close, toggle }}>
      {children}
    </SearchModalContext.Provider>
  );
}
