import React, { useState } from 'react';
import { RecommendationResult, SearchPreferences } from '../types';
import { ListingCard } from './ListingCard';
import { AllStaysMap } from './AllStaysMap';
import { collegesData } from '../data/colleges';
import { formatINR } from '../utils/formatters';
import { CheckCircle2, AlertOctagon, HelpCircle, RefreshCw, LayoutGrid, Map } from 'lucide-react';

import { getCategoryConfig } from '../config/categories';
import { CollegeLogo } from './CollegeLogo';

interface ResultsListProps {
  withinBudget: RecommendationResult[];
  overBudgetAlternatives: RecommendationResult[];
  preferences: SearchPreferences;
  onResetFilters: () => void;
  onOpenDetails: (result: RecommendationResult) => void;
  comparedResults: RecommendationResult[];
  onToggleCompare: (result: RecommendationResult) => void;
}

export const ResultsList: React.FC<ResultsListProps> = ({
  withinBudget,
  overBudgetAlternatives,
  preferences,
  onResetFilters,
  onOpenDetails,
  comparedResults,
  onToggleCompare
}) => {
  const college = collegesData.find(c => c.id === preferences.collegeId) || collegesData[0];
  const hasWithinBudget = withinBudget.length > 0;
  const hasAlternatives = overBudgetAlternatives.length > 0;
  const [viewMode, setViewMode] = useState<'cards' | 'map'>('cards');
  const catConfig = getCategoryConfig(college.category);

  const isItemCompared = (res: RecommendationResult) => {
    return comparedResults.some(c => c.id === res.id);
  };

  const allDisplayResults = hasWithinBudget 
    ? withinBudget.concat(overBudgetAlternatives) 
    : overBudgetAlternatives;

  return (
    <section className="results-section">
      {/* Results Header Summary Bar */}
      <div className="results-summary-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2px',
            flexShrink: 0,
            boxShadow: '0 2px 6px rgba(42, 63, 126, 0.08)'
          }}>
            <CollegeLogo
              logoUrl={college.logo}
              name={college.fullName}
              shortName={college.shortName}
              size={34}
            />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
              <span className="results-count-title">
                Recommended Living Options for {college.shortName}
              </span>
              <span style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                background: '#EEF2FF',
                color: '#2A3F7E',
                padding: '2px 8px',
                borderRadius: '9999px',
                border: '1px solid #C7D2FE'
              }}>
                {catConfig?.label || college.category}
              </span>
              <span style={{
                fontSize: '0.72rem',
                fontWeight: 600,
                background: '#F1F5F9',
                color: '#475569',
                padding: '2px 8px',
                borderRadius: '9999px'
              }}>
                📍 {college.locality}
              </span>
            </div>
            <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '0.2rem' }}>
              Budget: <strong>{formatINR(preferences.monthlyBudget)}/mo</strong> • Max distance: <strong>{preferences.maxDistanceKm} km</strong> • Meal preference: <strong>{preferences.foodPreference.replace('_', ' ')}</strong>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Cards vs Map View Toggle */}
          <div className="view-toggle-pill-group">
            <button
              type="button"
              className={`view-mode-toggle-btn ${viewMode === 'cards' ? 'active' : ''}`}
              onClick={() => setViewMode('cards')}
              aria-label="Cards view"
            >
              <LayoutGrid size={15} />
              <span>Cards</span>
            </button>
            <button
              type="button"
              className={`view-mode-toggle-btn ${viewMode === 'map' ? 'active' : ''}`}
              onClick={() => setViewMode('map')}
              aria-label="Map view"
            >
              <Map size={15} />
              <span>Map View</span>
            </button>
          </div>

          {hasWithinBudget ? (
            <span className="results-count-pill">
              ✓ {withinBudget.length} {withinBudget.length === 1 ? 'Option' : 'Options'} Within Budget
            </span>
          ) : (
            <span className="card-status-badge budget-over" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
              0 within {formatINR(preferences.monthlyBudget)} budget
            </span>
          )}
        </div>
      </div>

      {/* Case 1: NO WITHIN-BUDGET RESULTS (Over-Budget Alert Scenario) */}
      {!hasWithinBudget && hasAlternatives && (
        <div className="over-budget-notice">
          <div className="over-budget-icon">
            <AlertOctagon size={24} />
          </div>
          <div>
            <h3 className="over-budget-title">
              No accommodation + food combination fits within {formatINR(preferences.monthlyBudget)}/month
            </h3>
            <p className="over-budget-text">
              In Kolhapur, average independent student living (rent + electricity + 2 meals/day) realistically starts around <strong>₹4,500 – ₹5,500/month</strong> near {college.locality}. 
              We have not hidden this or pretended they fit your budget. Below are the <strong>closest alternatives</strong>, ranked by minimum budget overrun, so you can evaluate the gap before deciding.
            </p>
          </div>
        </div>
      )}

      {/* Case 2: ABSOLUTELY NOTHING FOUND (Filters too strict) */}
      {!hasWithinBudget && !hasAlternatives && (
        <div style={{ 
          background: 'white', 
          border: '1.5px dashed #cbd5e1', 
          borderRadius: '16px', 
          padding: '3rem 1.5rem', 
          textAlign: 'center', 
          margin: '2rem 0' 
        }}>
          <HelpCircle size={48} color="#94a3b8" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>No listings match these strict criteria</h3>
          <p style={{ color: '#64748b', maxWidth: '480px', margin: '0 auto 1.5rem', fontSize: '0.9rem' }}>
            Try increasing your maximum distance slider (e.g. up to 10 km) or selecting "All Room Types" to see more Kolhapur student stays.
          </p>
          <button className="btn-primary" onClick={onResetFilters}>
            <RefreshCw size={16} />
            <span>Reset Filters to Recommended</span>
          </button>
        </div>
      )}

      {/* MAP VIEW */}
      {viewMode === 'map' && (hasWithinBudget || hasAlternatives) && (
        <div style={{ marginTop: '1.5rem', marginBottom: '2.5rem' }}>
          <AllStaysMap
            college={college}
            results={allDisplayResults}
            onOpenDetails={onOpenDetails}
          />
        </div>
      )}

      {/* CARDS VIEW */}
      {viewMode === 'cards' && (
        <>
          {/* Within-Budget Cards Grid */}
          {hasWithinBudget && (
            <div style={{ marginBottom: '2.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                <CheckCircle2 size={20} color="#059669" />
                <h3 style={{ fontSize: '1.25rem' }}>
                  Options Within Your {formatINR(preferences.monthlyBudget)}/mo Budget
                </h3>
              </div>

              <div className="cards-grid">
                {withinBudget.map(result => (
                  <ListingCard
                    key={result.id}
                    result={result}
                    college={college}
                    onOpenDetails={onOpenDetails}
                    isCompared={isItemCompared(result)}
                    onToggleCompare={onToggleCompare}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Over-Budget Closest Alternatives */}
          {hasAlternatives && (!hasWithinBudget || overBudgetAlternatives.length > 0) && (
            <div style={{ marginTop: hasWithinBudget ? '3rem' : '1rem' }}>
              <div style={{ marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1.2rem', color: hasWithinBudget ? '#475569' : '#9f1239', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>{hasWithinBudget ? 'Alternative Options (Slightly Above Budget)' : 'Closest Available Alternatives'}</span>
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  {hasWithinBudget 
                    ? 'High-value listings requiring a modest budget stretch for upgraded amenities or closer campus walk.' 
                    : 'Ranked from least budget overrun to highest.'}
                </p>
              </div>

              <div className="cards-grid">
                {overBudgetAlternatives.slice(0, 6).map(result => (
                  <ListingCard
                    key={result.id}
                    result={result}
                    college={college}
                    onOpenDetails={onOpenDetails}
                    isCompared={isItemCompared(result)}
                    onToggleCompare={onToggleCompare}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
};
