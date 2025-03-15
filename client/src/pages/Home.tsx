import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Search } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Logo } from '@/components/Logo';

export function Home() {
  const [query, setQuery] = useState('');
  const [, setLocation] = useLocation();

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // Prevents new line
      handleSearch();
    }
  };

  const handleSearch = () => {
    if (query.trim()) {
      setLocation(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <ThemeToggle />
      <div className="w-full max-w-2xl animate-fade-in">
        <div className="flex flex-col items-center mb-8">
          <Logo className="mb-6" />
          <h1 className="text-2xl lg:text-4xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-200">
            What do you want to know?
          </h1>
        </div>

        <form onSubmit={(e) => e.preventDefault()} className="w-full">
          <div className="relative flex items-center w-full bg-white dark:bg-gray-800 rounded-2xl shadow-md transition-all focus-within:shadow-lg">
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Message Gemini 2.0"
              className="w-full px-5 py-3 text-lg bg-transparent border-none outline-none resize-none focus:ring-0 text-gray-900 dark:text-white rounded-2xl"
              style={{ fontFamily: 'Inter, sans-serif' }}
              rows={1}
            />
            <button
              type="button"
              onClick={handleSearch}
              disabled={!query.trim()}
              className="p-2 rounded-full transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700 active:scale-95 disabled:opacity-50"
            >
              <Search className="w-6 h-6 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400 animate-fade-in">
          <div>Powered by Gemini 2.0</div>
          <div>
            Created by{' '}
            <a href="https://www.davidayo.com/" target="_blank" rel="noopener noreferrer"
              className="hover:text-gray-800 dark:hover:text-gray-300 transition-colors">
              @Davidayo
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
