'use client';

import React from 'react';

import { Search, X } from 'lucide-react';
import { Input } from '../ui/input';

export const SearchToggle: React.FC = () => {
  const [searchValue, setSearchValue] = React.useState<string>('');
  const [isSearchOpen, setIsSearchOpen] = React.useState<boolean>(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  function openSearch() {
    inputRef.current?.focus();
    setIsSearchOpen(true);
  }

  function closeSearch() {
    setIsSearchOpen(false);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Escape') {
      closeSearch();
    }
  }

  function handleClick() {
    closeSearch();
  }

  React.useEffect(() => {
    console.log(searchValue);
  }, [searchValue]);

  return (
    <>
      <div className='flex items-center relative'>
        <Search
          size={20}
          className={`cursor-pointer ${isSearchOpen ? 'absolute top-1.5 left-1' : ''}`}
          onClick={openSearch}
        />

        <Input
          className={`text-primary border-primary transition-all duration-700 ease-in-out ${
            isSearchOpen ? 'w-64 opacity-100 px-7' : 'w-0 opacity-0 px-0'
          }`}
          placeholder='Search products...'
          ref={inputRef}
          onKeyDown={handleKeyDown}
          onChange={e => setSearchValue(e.target.value)}
          value={searchValue}
        />

        {isSearchOpen && (
          <X className='absolute top-1 right-1 cursor-pointer' onClick={handleClick} />
        )}
      </div>
    </>
  );
};
