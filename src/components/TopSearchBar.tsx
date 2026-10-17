import React, { useState, useEffect, useRef, useMemo } from 'react';
import Fuse from 'fuse.js';
import { Search, X, Clock, MapPin, Building2 } from 'lucide-react';
import { collegesData } from '../data/colleges';
import { COLLEGE_CATEGORIES, CollegeCategoryId } from '../config/categories';
import { CollegeLogo } from './CollegeLogo';
import type { College } from '../types';

interface TopSearchBarProps {
  onSelectCollege: (collegeId: string) => void;
  onViewAllColleges?: () => void;
  placeholder?: string;
}

const RECENT_SEARCHES_KEY = 'campusnest_recent_colleges';

export const TopSearchBar: React.FC<TopSearchBarProps> = ({
  onSelectCollege,
  onViewAllColleges,
  placeholder = 'Search college, course or area, e.g. DYPCET, MBBS, Atigre'
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

  // Keyboard shortcut: Pressing "/" anywhere focuses search bar (if not typing in another input)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== inputRef.current) {
        const tagName = (document.activeElement?.tagName || '').toLowerCase();
        if (tagName !== 'input' && tagName !== 'textarea' && tagName !== 'select') {
          e.preventDefault();
          inputRef.current?.focus();
          setIsOpen(true);
        }
      }
    };
    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

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
      threshold: 0.45,
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

    // Scroll smoothly to matcher
    const matcher = document.getElementById('matcher-section') || document.querySelector('.ecoriz-section');
    if (matcher) {
      matcher.scrollIntoView({ behavior: 'smooth' });
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
        <mark key={i} className="top-search-highlight">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div className="top-search-sticky-wrapper">
      <div ref={containerRef} className="top-search-container">
        {/* Search Input Box */}
        <div 
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-controls="top-search-listbox"
          className="top-search-input-pill"
        >
          <Search className="top-search-icon" size={18} aria-hidden="true" />
          
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
            aria-activedescendant={activeIndex >= 0 ? `top-option-${flatItems[activeIndex]?.id}` : undefined}
            className="top-search-field"
          />

          <div className="top-search-right-tools">
            {searchTerm ? (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setDebouncedTerm('');
                  setActiveIndex(-1);
                  inputRef.current?.focus();
                }}
                aria-label="Clear search"
                className="top-search-clear-btn"
              >
                <X size={16} />
              </button>
            ) : (
              <kbd className="top-search-shortcut-hint" title="Press / to search">
                /
              </kbd>
            )}
          </div>
        </div>

        {/* Dropdown Suggestions Panel */}
        {isOpen && (
          <div
            id="top-search-listbox"
            role="listbox"
            className="top-search-dropdown-panel"
          >
            {/* Search Results Grouped by Category */}
            {debouncedTerm.trim() && searchResults.length > 0 && (
              <div className="top-search-results-list">
                {Array.from(groupedResults.entries()).map(([catId, items]) => {
                  const catConfig = COLLEGE_CATEGORIES[catId];
                  return (
                    <div key={catId} className="top-search-category-group">
                      <div className="top-search-category-header">
                        <span>{catConfig?.icon || '🎓'}</span>
                        <span>{catConfig?.label || catId}</span>
                      </div>

                      {items.map(college => {
                        const itemIndex = flatItems.findIndex(c => c.id === college.id);
                        const isFocused = itemIndex === activeIndex;

                        return (
                          <div
                            key={college.id}
                            id={`top-option-${college.id}`}
                            role="option"
                            aria-selected={isFocused}
                            onClick={() => handleSelect(college)}
                            onMouseEnter={() => setActiveIndex(itemIndex)}
                            className={`top-search-result-row ${isFocused ? 'is-focused' : ''}`}
                          >
                            <div className="top-search-logo-cell">
                              <CollegeLogo
                                college={college}
                                className="top-search-logo-img"
                                monogramSize="sm"
                              />
                            </div>

                            <div className="top-search-info-cell">
                              <div className="top-search-title-row">
                                <span className="top-search-name">
                                  {highlightMatch(college.shortName, debouncedTerm)}
                                </span>
                                <span className="top-search-cat-badge">
                                  {catConfig?.shortLabel || catId}
                                </span>
                              </div>

                              <p className="top-search-fullname">
                                {highlightMatch(college.fullName, debouncedTerm)}
                              </p>

                              <div className="top-search-meta-row">
                                <span className="top-search-locality">
                                  <MapPin size={12} />
                                  {highlightMatch(college.locality, debouncedTerm)}
                                </span>
                                {college.courses && college.courses.length > 0 && (
                                  <span className="top-search-courses">
                                    • Courses: {college.courses.join(', ')}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}

                {onViewAllColleges && (
                  <div className="top-search-footer-browse">
                    <button
                      type="button"
                      onClick={() => {
                        setIsOpen(false);
                        onViewAllColleges();
                      }}
                      className="top-search-browse-all-link"
                    >
                      Browse all 34 colleges in Kolhapur &rarr;
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Empty State */}
            {debouncedTerm.trim() && searchResults.length === 0 && (
              <div className="top-search-empty-state">
                <Building2 size={32} className="top-search-empty-icon" />
                <p className="top-search-empty-title">
                  No college found. Try a different name or area
                </p>
                <p className="top-search-empty-subtitle">
                  We cover 34 verified colleges across Kolhapur.
                </p>
                {onViewAllColleges && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      onViewAllColleges();
                    }}
                    className="top-search-browse-all-btn"
                  >
                    Browse all 34 colleges
                  </button>
                )}
              </div>
            )}

            {/* Recent Searches */}
            {!debouncedTerm.trim() && (
              <div className="top-search-default-panel">
                {recentSearches.length > 0 && (
                  <div className="top-search-recents-section">
                    <div className="top-search-recents-header">
                      <span className="recents-label">
                        <Clock size={13} />
                        Recent Searches
                      </span>
                      <button
                        type="button"
                        onClick={clearRecentSearches}
                        className="recents-clear-btn"
                      >
                        clear
                      </button>
                    </div>

                    <div className="top-search-recents-list">
                      {recentSearches.map((term, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => {
                            setSearchTerm(term);
                            const col = collegesData.find(c => c.shortName.toLowerCase() === term.toLowerCase());
                            if (col) {
                              handleSelect(col);
                            } else {
                              setDebouncedTerm(term);
                            }
                          }}
                          className="top-search-recent-item"
                        >
                          <span className="recent-term-text">{term}</span>
                          <Search size={14} className="recent-icon" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="top-search-popular-tags">
                  <span className="popular-label">Popular in Kolhapur:</span>
                  <div className="popular-pills">
                    {['DYPCET', 'GMC Kolhapur', 'Vivekanand', 'SUK Law', 'SGU', 'CSIBER', 'Kasaba Bawada'].map(tag => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => {
                          const col = collegesData.find(c => c.shortName.toLowerCase() === tag.toLowerCase());
                          if (col) handleSelect(col);
                          else setSearchTerm(tag);
                        }}
                        className="popular-pill-chip"
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
    </div>
  );
};
