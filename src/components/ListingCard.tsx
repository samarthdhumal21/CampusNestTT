import React, { useState } from 'react';
import { RecommendationResult, College } from '../types';
import { formatINR, formatCommute } from '../utils/formatters';
import { DirectionsMap } from './DirectionsMap';
import { 
  MapPin, 
  Utensils, 
  Sparkles, 
  Check, 
  AlertTriangle, 
  Info, 
  Navigation,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface ListingCardProps {
  result: RecommendationResult;
  college: College;
  onOpenDetails: (result: RecommendationResult) => void;
  isCompared: boolean;
  onToggleCompare: (result: RecommendationResult) => void;
}

export const ListingCard: React.FC<ListingCardProps> = ({
  result,
  college,
  onOpenDetails,
  isCompared,
  onToggleCompare
}) => {
  const { accommodation, pairedMess, distanceToChosenCollege, breakdown, isWithinBudget, budgetDelta, matchReasons } = result;
  const [showMap, setShowMap] = useState(false);

  return (
    <article className={`listing-card ${isWithinBudget ? 'within-budget' : 'over-budget'}`}>
      {/* Top Header Badge Row */}
      <div className="card-top-bar">
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <span className="card-type-badge">{accommodation.type}</span>
          <span className={`badge-hostel-for badge-hostel-${accommodation.hostelFor || (accommodation.genderAllowed === 'Girls' ? 'girls' : accommodation.genderAllowed === 'Boys' ? 'boys' : 'any')}`}>
            {accommodation.hostelFor === 'girls' || accommodation.genderAllowed === 'Girls' ? '👩 Girls Hostel' : accommodation.hostelFor === 'boys' || accommodation.genderAllowed === 'Boys' ? '👨 Boys Hostel' : '🤝 Co-ed / Any'}
          </span>
          {accommodation.lastUpdated && (
            <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
              • {accommodation.lastUpdated}
            </span>
          )}
        </div>

        <div>
          {isWithinBudget ? (
            <span className="card-status-badge budget-fit">
              <Check size={12} strokeWidth={3} />
              {budgetDelta > 0 ? `Fits (${formatINR(budgetDelta)} buffer)` : 'Fits Exactly'}
            </span>
          ) : (
            <span className="card-status-badge budget-over">
              <AlertTriangle size={12} />
              +{formatINR(Math.abs(budgetDelta))} over budget
            </span>
          )}
        </div>
      </div>

      <div className="card-body">
        {/* Title & Locality */}
        <h3 className="card-title">{accommodation.name}</h3>
        <div className="card-locality">
          <MapPin size={14} color="#64748b" />
          <span>{accommodation.locality} • {formatCommute(distanceToChosenCollege)}</span>
        </div>

        {/* Highlight Quote */}
        <p style={{ fontSize: '0.82rem', color: '#475569', marginBottom: '0.75rem', fontStyle: 'italic' }}>
          "{accommodation.highlight}"
        </p>

        {/* Cost Box */}
        <div className="cost-box">
          <div className="cost-primary-row">
            <div>
              <span className="cost-label">Estimated Monthly Total</span>
              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Rent + Utilities + Food + Transit</div>
            </div>
            <div className={`cost-value-total ${!isWithinBudget ? 'over' : ''}`}>
              {formatINR(breakdown.totalMonthly)}
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>/mo</span>
            </div>
          </div>

          {/* Deposit Separately Displayed */}
          <div style={{ margin: '0.4rem 0' }}>
            <span className="deposit-pill">
              💰 Deposit: {formatINR(breakdown.deposit)} (One-time, non-recurring)
            </span>
          </div>

          {/* Itemized Mini List */}
          <div className="itemized-mini-list">
            <div className="itemized-row">
              <span>Room Rent:</span>
              <strong>{formatINR(breakdown.rent)}</strong>
            </div>
            <div className="itemized-row">
              <span>Utilities (Electricity & Water):</span>
              <strong>{formatINR(breakdown.utilities)}</strong>
            </div>
            <div className="itemized-row">
              <span>Food / Meals:</span>
              <strong>
                {accommodation.foodIncluded 
                  ? 'Included in Stay (₹0)' 
                  : `${formatINR(breakdown.foodCost)} (${pairedMess ? pairedMess.name : 'Mess'})`}
              </strong>
            </div>
            <div className="itemized-row">
              <span>Estimated Transport to Campus:</span>
              <strong>{breakdown.transportCost === 0 ? '₹0 (Walking)' : formatINR(breakdown.transportCost)}</strong>
            </div>
          </div>

          {/* Step-by-Step Calculation Formula String */}
          <div className="formula-badge">
            🧮 <strong>Calculation:</strong> {breakdown.formulaText}
          </div>
        </div>

        {/* Paired Mess or Built-in Food Banner */}
        {accommodation.foodIncluded ? (
          <div style={{ background: '#ecfdf5', border: '1px solid #d1fae5', padding: '0.65rem 0.85rem', borderRadius: '12px', marginBottom: '0.75rem' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: '#047857', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Utensils size={13} />
              All Meals Included In Stay
            </div>
            <div style={{ fontSize: '0.82rem', color: '#065f46', marginTop: '0.15rem' }}>
              {accommodation.foodIncludedNotes || 'Daily breakfast, lunch, and dinner prepared in-house.'}
            </div>
          </div>
        ) : pairedMess ? (
          <div className="paired-mess-box">
            <div className="paired-mess-header">
              <Utensils size={13} />
              Recommended Mess Pairing
            </div>
            <div className="paired-mess-name">
              {pairedMess.name} ({formatINR(pairedMess.monthlyMealPrice)}/mo)
            </div>
            <div className="paired-mess-desc">
              {pairedMess.foodType} • {pairedMess.locality} • Sunday: {pairedMess.sundaySpecial}
            </div>
          </div>
        ) : null}

        {/* Why this matches reasons */}
        <div className="match-reasons-box">
          {matchReasons.slice(0, 2).map((reason, idx) => (
            <div key={idx} className="match-reason-item">
              <Sparkles size={12} />
              <span>{reason}</span>
            </div>
          ))}
        </div>

        {/* Amenities Preview */}
        <div className="amenities-strip">
          {accommodation.amenities.slice(0, 4).map((amenity, idx) => (
            <span key={idx} className="amenity-chip">
              {amenity}
            </span>
          ))}
          {accommodation.amenities.length > 4 && (
            <span className="amenity-chip" style={{ background: '#e2e8f0' }}>
              +{accommodation.amenities.length - 4} more
            </span>
          )}
        </div>

        {/* Expandable Route & Map Button */}
        <button
          type="button"
          className="btn-map-toggle-pill"
          onClick={() => setShowMap(!showMap)}
        >
          <Navigation size={14} color="#2A3F7E" />
          <span>{showMap ? 'Hide Directions & Map' : 'View Route & Directions'}</span>
          {showMap ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {/* Expandable Directions Map Section */}
        {showMap && (
          <div style={{ marginTop: '0.85rem' }}>
            <DirectionsMap 
              college={college} 
              stay={accommodation} 
              listedDistanceKm={distanceToChosenCollege} 
              compact={true} 
            />
          </div>
        )}
      </div>

      {/* Footer with Card Actions */}
      <div className="card-footer">
        <button
          className="btn-card-action"
          onClick={() => onOpenDetails(result)}
        >
          <Info size={15} />
          <span>Full Breakdown & Contact</span>
        </button>

        <button
          className={`btn-compare-toggle ${isCompared ? 'selected' : ''}`}
          onClick={() => onToggleCompare(result)}
          title="Compare up to 3 stays side-by-side"
        >
          {isCompared ? '✓ Compared' : '+ Compare'}
        </button>
      </div>
    </article>
  );
};
