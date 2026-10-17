import React, { useState, useMemo } from 'react';
import { ArrowRight, Database, Check, Grid, X, Building2 } from 'lucide-react';
import { collegesData } from '../data/colleges';
import { accommodationsData } from '../data/accommodations';
import { messesData } from '../data/messes';
import { COLLEGE_CATEGORIES } from '../config/categories';
import { CollegeLogo } from './CollegeLogo';
import { AuthForm } from './auth/AuthForm';

interface HeroProps {
  selectedCollegeId?: string;
  onFindStayClick: (collegeId?: string) => void;
  onExploreClick: () => void;
  onNavigateDashboard?: () => void;
}

export const Hero: React.FC<HeroProps> = ({ 
  selectedCollegeId, 
  onFindStayClick, 
  onExploreClick,
  onNavigateDashboard
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [showAllModal, setShowAllModal] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initial load skeleton simulation for performance
  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 200);
    return () => clearTimeout(timer);
  }, []);

  // Compute count per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: collegesData.length };
    COLLEGE_CATEGORIES.forEach(cat => {
      counts[cat.id] = collegesData.filter(c => c.category === cat.id).length;
    });
    return counts;
  }, []);

  // Filter colleges for the selected category tab
  const filteredColleges = useMemo(() => {
    if (activeCategory === 'all') return collegesData;
    return collegesData.filter(c => c.category === activeCategory);
  }, [activeCategory]);

  // Determine marquee vs static centered row (static if 4 or fewer colleges)
  const isMarqueeMode = filteredColleges.length > 4;

  const handleCardClick = (collegeId: string) => {
    onFindStayClick(collegeId);
    if (showAllModal) {
      setShowAllModal(false);
    }
  };

  return (
    <div className="hero-container-outer">
      <section className="ecoriz-hero">
        <div className="hero-grid-layout">
          {/* Hero Left Column */}
          <div className="hero-left-column">
            {/* Top Outlined Pill Tag */}
            <div className="hero-tag-pill">
              <span className="hero-tag-dot" />
              <span>Kolhapur Student Living Cost & Stay Finder</span>
            </div>

            {/* Huge White Bold Heading */}
            <h1 className="hero-main-heading">
              Know Your Real Living Cost <br className="hero-br" />
              Before Moving to Kolhapur.
            </h1>

            {/* Subtext */}
            <p className="hero-subtext">
              Joining a college in Kolhapur? See your real monthly cost: rent + utilities + food + commute, before you arrive.
            </p>

            {/* Hero CTAs */}
            <div className="hero-button-group">
              <button className="pill-btn-white-cta" onClick={() => onFindStayClick()}>
                <span>Find My Stay</span>
                <span className="pill-icon-dark-circle">
                  <ArrowRight size={15} />
                </span>
              </button>

              <button className="pill-btn-glass-cta" onClick={onExploreClick}>
                <span>Browse All Listings</span>
              </button>
            </div>

            {/* Floating Glass Stat Card */}
            <div className="hero-floating-stat-card">
              <div className="stat-card-badge">
                <Database size={13} color="#A9C8E8" />
                <span>Illustrative demo data</span>
              </div>
              <div className="stat-card-metrics">
                <span>{accommodationsData.length}+ sample stays</span>
                <span className="stat-divider">·</span>
                <span>{messesData.length} sample messes</span>
                <span className="stat-divider">·</span>
                <span>{collegesData.length} colleges</span>
              </div>
            </div>
          </div>

          {/* Hero Right Column: Auth Card matching Screenshot 1 */}
          <div className="hero-right-column">
            <div className="hero-auth-card-wrapper">
              <AuthForm 
                variant="card" 
                onNavigateDashboard={onNavigateDashboard} 
              />
            </div>
          </div>
        </div>
      </section>

      {/* College Logo Strip under Hero */}
      <div className="college-strip-wrapper">
        <div className="college-strip-inner">
          <div className="college-strip-header">
            <div>
              <span className="college-strip-label">COLLEGES & INSTITUTES</span>
              <span className="college-strip-hint">
                <span className="pulse-dot" /> Click any campus to calculate living costs
              </span>
            </div>

            {/* View All Colleges Modal Trigger */}
            <button
              type="button"
              className="view-all-colleges-btn"
              onClick={() => setShowAllModal(true)}
              aria-label="View all colleges in full grid modal"
            >
              <Grid size={14} />
              <span>View all colleges ({collegesData.length})</span>
            </button>
          </div>

          {/* Category Pill Tabs (Search moved to sticky top bar as per PART 2) */}
          <div className="college-strip-controls">
            {/* Tabs List */}
            <div 
              className="category-pill-tabs" 
              role="tablist" 
              aria-label="Filter colleges by category"
            >
              <button
                type="button"
                role="tab"
                id="tab-all"
                aria-selected={activeCategory === 'all'}
                aria-controls="college-carousel-panel"
                className={`category-pill-tab ${activeCategory === 'all' ? 'active' : ''}`}
                onClick={() => setActiveCategory('all')}
              >
                <span>All</span>
                <span className="tab-count-badge">{categoryCounts.all}</span>
              </button>

              {COLLEGE_CATEGORIES.map(cat => {
                const count = categoryCounts[cat.id] || 0;
                if (count === 0) return null;

                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    role="tab"
                    id={`tab-${cat.id}`}
                    aria-selected={isActive}
                    aria-controls="college-carousel-panel"
                    className={`category-pill-tab ${isActive ? 'active' : ''}`}
                    onClick={() => setActiveCategory(cat.id)}
                  >
                    <span>{cat.shortLabel || cat.label}</span>
                    <span className="tab-count-badge">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Carousel / Static Strip Content */}
          <div
            id="college-carousel-panel"
            className={`college-carousel-container ${isPaused ? 'is-paused' : ''} ${!isMarqueeMode ? 'is-static-row' : ''}`}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setIsPaused(false)}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onFocus={() => setIsPaused(true)}
            onBlur={() => setIsPaused(false)}
            tabIndex={0}
            role="region"
            aria-label="Colleges and Institutes carousel"
          >
            {isLoading ? (
              <div className="carousel-track">
                <div className="carousel-group">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div key={i} className="college-logo-card college-card-skeleton" />
                  ))}
                </div>
              </div>
            ) : isMarqueeMode ? (
              /* Marquee with aria-hidden clone for seamless infinite loop */
              <div className="carousel-track">
                {/* Primary Card List */}
                <div className="carousel-group">
                  {filteredColleges.map((college) => {
                    const isSelected = selectedCollegeId === college.id;
                    const isWhiteLogo = college.id === 'dyp-talsande';
                    return (
                      <button
                        type="button"
                        key={college.id}
                        className={`college-logo-card ${isSelected ? 'selected' : ''} ${isWhiteLogo ? 'card-dyp-talsande' : ''}`}
                        onClick={() => handleCardClick(college.id)}
                        aria-label={`${college.fullName} (${college.locality})`}
                      >
                        <div className="college-logo-img-wrapper">
                          <CollegeLogo
                            college={college}
                            className="college-logo-img"
                          />
                        </div>
                        <span className="college-card-shortname">
                          {college.shortName}
                        </span>
                        {isSelected && (
                          <span className="college-card-check-badge" title="Selected for living cost calculation">
                            <Check size={10} color="#FFFFFF" strokeWidth={3} />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Duplicated Marquee Card List for Smooth Infinite Scrolling */}
                <div className="carousel-group" aria-hidden="true">
                  {filteredColleges.map((college) => {
                    const isSelected = selectedCollegeId === college.id;
                    const isWhiteLogo = college.id === 'dyp-talsande';
                    return (
                      <button
                        type="button"
                        key={`clone-${college.id}`}
                        className={`college-logo-card ${isSelected ? 'selected' : ''} ${isWhiteLogo ? 'card-dyp-talsande' : ''}`}
                        onClick={() => handleCardClick(college.id)}
                        tabIndex={-1}
                      >
                        <div className="college-logo-img-wrapper">
                          <CollegeLogo
                            college={college}
                            className="college-logo-img"
                          />
                        </div>
                        <span className="college-card-shortname">
                          {college.shortName}
                        </span>
                        {isSelected && (
                          <span className="college-card-check-badge" title="Selected for living cost calculation">
                            <Check size={10} color="#FFFFFF" strokeWidth={3} />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* Static Centered Row for 4 or Fewer Colleges */
              <div className="college-static-row">
                {filteredColleges.map((college) => {
                  const isSelected = selectedCollegeId === college.id;
                  const isWhiteLogo = college.id === 'dyp-talsande';
                  return (
                    <button
                      type="button"
                      key={college.id}
                      className={`college-logo-card ${isSelected ? 'selected' : ''} ${isWhiteLogo ? 'card-dyp-talsande' : ''}`}
                      onClick={() => handleCardClick(college.id)}
                      aria-label={`${college.fullName} (${college.locality})`}
                    >
                      <div className="college-logo-img-wrapper">
                        <CollegeLogo
                          college={college}
                          className="college-logo-img"
                        />
                      </div>
                      <span className="college-card-shortname">
                        {college.shortName}
                      </span>
                      {isSelected && (
                        <span className="college-card-check-badge" title="Selected for living cost calculation">
                          <Check size={10} color="#FFFFFF" strokeWidth={3} />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Full "View All Colleges" Modal Grid (5 cols desktop, 2 cols mobile) */}
      {showAllModal && (
        <div 
          className="colleges-modal-overlay" 
          onClick={() => setShowAllModal(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="colleges-modal-title"
        >
          <div 
            className="colleges-modal-container" 
            onClick={e => e.stopPropagation()}
          >
            <div className="colleges-modal-header">
              <div>
                <h3 id="colleges-modal-title" className="colleges-modal-title">
                  All Kolhapur Colleges & Institutes ({collegesData.length})
                </h3>
                <p className="colleges-modal-sub">
                  Click any campus to calculate itemized monthly living costs and nearby stays.
                </p>
              </div>
              <button
                type="button"
                className="colleges-modal-close"
                onClick={() => setShowAllModal(false)}
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            <div className="colleges-modal-body">
              {COLLEGE_CATEGORIES.map(cat => {
                const collegesInCat = collegesData.filter(c => c.category === cat.id);
                if (collegesInCat.length === 0) return null;

                return (
                  <div key={cat.id} className="modal-category-section">
                    <div className="modal-category-header">
                      <span className="modal-category-icon">{cat.icon}</span>
                      <h4 className="modal-category-title">{cat.label} ({collegesInCat.length})</h4>
                    </div>

                    <div className="modal-colleges-grid">
                      {collegesInCat.map(col => {
                        const isSelected = selectedCollegeId === col.id;
                        const isWhiteLogo = col.id === 'dyp-talsande';
                        return (
                          <button
                            type="button"
                            key={col.id}
                            className={`college-logo-card modal-grid-card ${isSelected ? 'is-selected' : ''} ${isWhiteLogo ? 'college-card-dark-bg' : ''}`}
                            onClick={() => handleCardClick(col.id)}
                            aria-label={`${col.fullName} (${col.locality})`}
                          >
                            <div className="college-logo-img-wrapper">
                              <CollegeLogo
                                college={col}
                                className="college-logo-img"
                              />
                            </div>
                            <span className="college-short-name truncate">
                              {col.shortName}
                            </span>
                            <span className="college-locality-tag truncate">
                              {col.locality}
                            </span>
                            {isSelected && (
                              <span className="college-selected-badge">
                                <Check size={10} color="#FFFFFF" strokeWidth={3} />
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
