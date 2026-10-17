import React, { useState, useEffect, useRef, useMemo } from 'react';
import Fuse from 'fuse.js';
import { Search, X, Clock, MapPin, Sparkles, Building2 } from 'lucide-react';
import { collegesData } from '../data/colleges';
import { COLLEGE_CATEGORIES, CollegeCategoryId } from '../config/categories';
import { CollegeLogo } from './CollegeLogo';
import type { College } from '../types';

interface CollegeSearchProps {
  onSelectCollege: (collegeId: string) => void;
  onViewAllColleges?: () => void;
  placeholder?: string;
  className?: string;
  autoScrollToMatcher?: boolean;
}

const RECENT_SEARCHES_KEY = 'campusnest_recent_colleges';

export const CollegeSearch: React.FC<CollegeSearchProps> = ({
  onSelectCollege,
  onViewAllColleges,
  placeholder = 'Search college, course (MBBS, Law), or area (Bawada, Atigre)...',
  className = '',
  autoScrollToMatcher = true
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedTerm, setDebouncedTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (raw) setRecentSearches(JSON.parse(raw).slice(0, 5));
    } catch {
      // ignore
    }
  }, []);

  const saveRecentSearch = (term: string) => {
    try {
      const trimmed = term.trim();
      if (!trimmed) return;
      const filtered = [trimmed, ...recentSearches.filter(s => s.toLowerCase() !== trimmed.toLowerCase())].slice(0, 5);
      setRecentSearches(filtered);
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(filtered));
    } catch {
      // ignore
    }
  };

  const clearRecentSearches = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentSearches([]);
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  };

  // Debounce input term by 200ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, 200);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Configure Fuse.js for forgiving fuzzy matching across all 34 colleges
  const fuse = useMemo(() => {
    return new Fuse(collegesData, {
      keys: [
        { name: 'shortName', weight: 0.35 },
        { name: 'fullName', weight: 0.25 },
        { name: 'courses', weight: 0.2 },
        { name: 'category', weight: 0.1 },
        { name: 'locality', weight: 0.1 }
      ],
      threshold: 0.45, // Tolerates small typos like 'rajram' -> 'rajaram'
      ignoreLocation: true,
      minMatchCharLength: 2,
      shouldSort: true
    });
  }, []);

  // Filtered results capped at 8 items
  const searchResults: College[] = useMemo(() => {
    const clean = debouncedTerm.trim();
    if (!clean) return [];

    const fuseResults = fuse.search(clean);
    return fuseResults.slice(0, 8).map(res => res.item);
  }, [debouncedTerm, fuse]);

  // Group results by category
  const groupedResults = useMemo(() => {
    const map = new Map<CollegeCategoryId, College[]>();
    for (const college of searchResults) {
      const list = map.get(college.category) || [];
      list.push(college);
      map.set(college.category, list);
    }
    return map;
  }, [searchResults]);

  // Flattened items for keyboard arrow navigation
  const flatItems = searchResults;

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (college: College) => {
    saveRecentSearch(college.shortName);
    setSearchTerm(college.shortName);
    setIsOpen(false);
    onSelectCollege(college.id);

    if (autoScrollToMatcher) {
      const matcherSection = document.getElementById('matcher-section') || document.querySelector('.ecoriz-section');
      if (matcherSection) {
        matcherSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(prev => (prev < flatItems.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => (prev > 0 ? prev - 1 : flatItems.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < flatItems.length) {
        handleSelect(flatItems[activeIndex]);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      setActiveIndex(-1);
    }
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;
    const regex = new RegExp(`(${query.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-sky-200/90 text-navy-950 font-semibold px-0.5 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div ref={containerRef} className={`college-search-container relative w-full ${className}`}>
      {/* Search Input Box */}
      <div 
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls="college-search-listbox"
        className="relative flex items-center w-full"
      >
        <Search className="absolute left-4 w-4 h-4 text-slate-400 pointer-events-none" />
        
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={e => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
            setActiveIndex(-1);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          aria-autocomplete="list"
          aria-activedescendant={activeIndex >= 0 ? `college-option-${flatItems[activeIndex]?.id}` : undefined}
          className="w-full pl-11 pr-10 py-3 bg-white/95 text-navy-950 placeholder-slate-400 text-sm rounded-full border border-slate-200/90 shadow-sm hover:border-navy-400 focus:outline-none focus:border-navy-700 focus:ring-2 focus:ring-navy-100 transition-all"
        />

        {searchTerm && (
          <button
            type="button"
            onClick={() => {
              setSearchTerm('');
              setDebouncedTerm('');
              setActiveIndex(-1);
              inputRef.current?.focus();
            }}
            aria-label="Clear college search"
            className="absolute right-3.5 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Dropdown Suggestions */}
      {isOpen && (
        <div
          id="college-search-listbox"
          role="listbox"
          className="absolute z-50 left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-200 max-h-96 overflow-y-auto animate-fade-in p-2"
        >
          {/* SEARCH RESULTS GROUPED BY CATEGORY */}
          {debouncedTerm.trim() && searchResults.length > 0 && (
            <div className="space-y-3">
              {Array.from(groupedResults.entries()).map(([catId, items]) => {
                const catConfig = COLLEGE_CATEGORIES[catId];
                return (
                  <div key={catId} className="space-y-1">
                    <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <span>{catConfig?.icon || '🎓'}</span>
                      <span>{catConfig?.label || catId}</span>
                    </div>

                    {items.map(college => {
                      const itemIndex = flatItems.findIndex(c => c.id === college.id);
                      const isFocused = itemIndex === activeIndex;

                      return (
                        <div
                          key={college.id}
                          id={`college-option-${college.id}`}
                          role="option"
                          aria-selected={isFocused}
                          onClick={() => handleSelect(college)}
                          onMouseEnter={() => setActiveIndex(itemIndex)}
                          className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-colors ${
                            isFocused ? 'bg-sky-50 text-navy-950 border border-sky-200' : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          {/* 32px College Logo with monogram fallback */}
                          <div className="flex-shrink-0 w-8 h-8 rounded-lg overflow-hidden bg-white border border-slate-200 flex items-center justify-center p-0.5">
                            <CollegeLogo
                              college={college}
                              className="w-full h-full object-contain"
                              monogramSize="sm"
                            />
                          </div>

                          {/* College Information */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs text-navy-950 truncate">
                                {highlightMatch(college.shortName, debouncedTerm)}
                              </span>
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                                {catConfig?.shortLabel || catId}
                              </span>
                            </div>

                            <p className="text-[11px] text-slate-500 truncate">
                              {highlightMatch(college.fullName, debouncedTerm)}
                            </p>

                            <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400">
                              <span className="flex items-center gap-0.5">
                                <MapPin className="w-3 h-3 text-slate-400" />
                                {highlightMatch(college.locality, debouncedTerm)}
                              </span>
                              {college.courses && college.courses.length > 0 && (
                                <>
                                  <span>•</span>
                                  <span>Courses: {college.courses.join(', ')}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )}

          {/* EMPTY STATE */}
          {debouncedTerm.trim() && searchResults.length === 0 && (
            <div className="p-6 text-center">
              <Building2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-semibold text-navy-950">
                No college found. Try a different name or area
              </p>
              <p className="text-[11px] text-slate-400 mt-1 mb-4">
                We cover 34 verified colleges across Kolhapur.
              </p>
              {onViewAllColleges && (
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    onViewAllColleges();
                  }}
                  className="px-4 py-2 bg-navy-800 text-white rounded-full text-xs font-semibold hover:bg-navy-900 transition shadow-sm"
                >
                  Browse all 34 colleges
                </button>
              )}
            </div>
          )}

          {/* RECENT SEARCHES STATE WHEN SEARCH IS EMPTY */}
          {!debouncedTerm.trim() && (
            <div>
              {recentSearches.length > 0 && (
                <div className="mb-2">
                  <div className="px-3 py-1 flex items-center justify-between text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3 h-3" />
                      Recent Searches
                    </span>
                    <button
                      type="button"
                      onClick={clearRecentSearches}
                      className="hover:text-slate-600 lowercase text-[10px]"
                    >
                      clear
                    </button>
                  </div>

                  <div className="space-y-0.5">
                    {recentSearches.map((term, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          setSearchTerm(term);
                          // find college by shortName if exists
                          const col = collegesData.find(c => c.shortName.toLowerCase() === term.toLowerCase());
                          if (col) {
                            handleSelect(col);
                          } else {
                            setDebouncedTerm(term);
                          }
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 transition text-xs text-slate-700 flex items-center justify-between"
                      >
                        <span className="truncate">{term}</span>
                        <Search className="w-3 h-3 text-slate-400" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggestions */}
              <div className="p-3 bg-slate-50/70 rounded-xl text-xs text-slate-500">
                <span className="font-semibold text-navy-900 block mb-1">Popular searches:</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {['DYPCET', 'GMC Kolhapur', 'Vivekanand', 'SUK Law', 'SGU', 'CSIBER'].map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        const col = collegesData.find(c => c.shortName.toLowerCase() === tag.toLowerCase());
                        if (col) handleSelect(col);
                        else setSearchTerm(tag);
                      }}
                      className="px-2.5 py-1 rounded-full bg-white border border-slate-200 text-[11px] text-navy-800 hover:border-navy-400 transition"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
