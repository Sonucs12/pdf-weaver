'use client';

import * as React from 'react';
import { Search, X } from 'lucide-react';
import { Input } from './input';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onSearch?: (query: string) => void;
  onClear?: () => void;
  wrapperClassName?: string;
}

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, type, onSearch, onClear, wrapperClassName, value, ...props }, ref) => {
    const [query, setQuery] = React.useState<string>((value as string) || '');

    React.useEffect(() => {
      setQuery((value as string) || '');
    }, [value]);

    const handleSearchClick = () => {
      if (onSearch) {
        onSearch(query);
      }
    };

    const handleClearClick = () => {
      setQuery('');
      if (onClear) {
        onClear();
      }
      if (onSearch) {
        onSearch(''); // Trigger search with empty query on clear
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        handleSearchClick();
      }
    };

    return (
      <div className={cn('relative flex items-center', wrapperClassName)}>
        <Input
          type="text"
          className={cn('pr-10', className)}
          placeholder="Search..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          ref={ref}
          {...props}
        />
        {query && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-10 h-7 w-7 p-0 text-muted-foreground"
            onClick={handleClearClick}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Clear search</span>
          </Button>
        )}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-0 h-7 w-7 p-0 text-muted-foreground"
          onClick={handleSearchClick}
        >
          <Search className="h-4 w-4" />
          <span className="sr-only">Search</span>
        </Button>
      </div>
    );
  }
);
SearchInput.displayName = 'SearchInput';
