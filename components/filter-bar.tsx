'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Search, X, Filter, Settings } from 'lucide-react';
import type { FilterState, Language, Role, Complexity } from '@/lib/types';

interface FilterBarProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onOpenPreferences: () => void;
}

export function FilterBar({ filters, onFiltersChange, onOpenPreferences }: FilterBarProps) {
  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilter = <K extends keyof FilterState>(key: K) => {
    const newFilters = { ...filters };
    delete newFilters[key];
    onFiltersChange(newFilters);
  };

  const clearAllFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = Object.keys(filters).length > 0;

  return (
    <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="container mx-auto px-4 py-4">
        {/* Active filters display */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className="text-sm text-muted-foreground">Active filters:</span>

            {filters.role && (
              <Badge variant="secondary" className="gap-1">
                Role: {filters.role}
                <button
                  onClick={() => clearFilter('role')}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}

            {filters.language && (
              <Badge variant="secondary" className="gap-1">
                Language: {filters.language}
                <button
                  onClick={() => clearFilter('language')}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}

            {filters.framework && (
              <Badge variant="secondary" className="gap-1">
                Framework: {filters.framework}
                <button
                  onClick={() => clearFilter('framework')}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}

            {filters.complexity && (
              <Badge variant="secondary" className="gap-1">
                Level: {filters.complexity}
                <button
                  onClick={() => clearFilter('complexity')}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="h-6 text-xs"
              >
                Clear all
              </Button>
            )}

            <Separator orientation="vertical" className="h-6" />

            <Button
              variant="outline"
              size="sm"
              onClick={onOpenPreferences}
              className="h-6 text-xs gap-1"
            >
              <Settings className="h-3 w-3" />
              Edit preferences
            </Button>
          </div>
        )}

        {/* Filter controls */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search documentation, examples, guides..."
              className="pl-9"
              value={filters.search || ''}
              onChange={(e) => updateFilter('search', e.target.value)}
            />
          </div>

          {/* Role filter */}
          <Select
            value={filters.role || 'all'}
            onValueChange={(value) => updateFilter('role', value === 'all' ? undefined : value as Role)}
          >
            <SelectTrigger className="w-[180px]">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <SelectValue placeholder="All roles" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All roles</SelectItem>
              <SelectItem value="client">Make payments</SelectItem>
              <SelectItem value="server">Accept payments</SelectItem>
              <SelectItem value="facilitator">Run facilitator</SelectItem>
            </SelectContent>
          </Select>

          {/* Language filter */}
          <Select
            value={filters.language || 'all'}
            onValueChange={(value) => updateFilter('language', value === 'all' ? undefined : value as Language)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All languages" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All languages</SelectItem>
              <SelectItem value="typescript">TypeScript</SelectItem>
              <SelectItem value="go">Go</SelectItem>
              <SelectItem value="python">Python</SelectItem>
              <SelectItem value="java">Java</SelectItem>
            </SelectContent>
          </Select>

          {/* Framework filter - show only if language is selected */}
          {filters.language && filters.language !== 'any' && (
            <Select
              value={filters.framework || 'all'}
              onValueChange={(value) => updateFilter('framework', value === 'all' ? undefined : value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All frameworks" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All frameworks</SelectItem>
                {filters.language === 'typescript' && (
                  <>
                    <SelectItem value="express">Express.js</SelectItem>
                    <SelectItem value="hono">Hono</SelectItem>
                    <SelectItem value="nextjs">Next.js</SelectItem>
                    <SelectItem value="axios">Axios</SelectItem>
                    <SelectItem value="fetch">Fetch API</SelectItem>
                  </>
                )}
                {filters.language === 'go' && (
                  <>
                    <SelectItem value="gin">Gin</SelectItem>
                    <SelectItem value="http">Standard HTTP</SelectItem>
                  </>
                )}
                {filters.language === 'python' && (
                  <>
                    <SelectItem value="fastapi">FastAPI</SelectItem>
                    <SelectItem value="flask">Flask</SelectItem>
                    <SelectItem value="httpx">httpx</SelectItem>
                    <SelectItem value="requests">requests</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          )}

          {/* Complexity filter */}
          <Select
            value={filters.complexity || 'all'}
            onValueChange={(value) => updateFilter('complexity', value === 'all' ? undefined : value as Complexity)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All levels" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All levels</SelectItem>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
