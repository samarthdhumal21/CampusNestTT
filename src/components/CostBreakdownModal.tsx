import React from 'react';
import { RecommendationResult, College } from '../types';
import { formatINR, formatCommute } from '../utils/formatters';
import { collegesData } from '../data/colleges';
import { COLLEGE_CATEGORIES, getCategoryConfig } from '../config/categories';
import { DirectionsMap } from './DirectionsMap';
import { CollegeLogo } from './CollegeLogo';
import { 
  X, 
  MapPin, 
  ShieldAlert, 
  Phone, 
  Check, 
  Utensils, 
  Building2, 
  AlertTriangle,
  Info,
  Clock,
  Sparkles,
  Navigation,
  GraduationCap
} from 'lucide-react';

interface CostBreakdownModalProps {
  result: RecommendationResult | null;
  college?: College;
  onClose: () => void;
}

export const CostBreakdownModal: React.FC<CostBreakdownModalProps> = ({ result, college, onClose }) => {
  if (!result) return null;

  const { accommodation, pairedMess, distanceToChosenCollege, breakdown, isWithinBudget, budgetDelta } = result;

  const primaryCollege = college || 
    collegesData.find(c => c.id === accommodation.collegesServed[0]?.collegeId) || 
    collegesData[0];
  const catConfig = getCategoryConfig(primaryCollege.category);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div>
            <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.35rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <span className="card-type-badge">{accommodation.type}</span>
              <span className={`badge-hostel-for badge-hostel-${accommodation.hostelFor || (accommodation.genderAllowed === 'Girls' ? 'girls' : accommodation.genderAllowed === 'Boys' ? 'boys' : 'any')}`}>
                {accommodation.hostelFor === 'girls' || accommodation.genderAllowed === 'Girls' ? '👩 Girls Hostel' : accommodation.hostelFor === 'boys' || accommodation.genderAllowed === 'Boys' ? '👨 Boys Hostel' : '🤝 Co-ed / Any'}
              </span>
              {accommodation.lastUpdated && (
                <span style={{ fontSize: '0.7rem', color: '#64748B' }}>
                  • Verified {accommodation.lastUpdated}
                </span>
              )}
            </div>
            <h2 style={{ fontSize: '1.4rem' }}>{accommodation.name}</h2>
            <div style={{ fontSize: '0.85rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.2rem' }}>
              <MapPin size={14} />
              <span>{accommodation.address}</span>
            </div>

            {/* Target College info strip */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#F8FAFC', padding: '0.35rem 0.75rem', borderRadius: '10px', border: '1px solid #E2E8F0', marginTop: '0.6rem' }}>
              <div style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CollegeLogo
                  logoUrl={primaryCollege.logo}
                  name={primaryCollege.fullName}
                  shortName={primaryCollege.shortName}
                  size={24}
                />
              </div>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1E293B' }}>
                {primaryCollege.shortName}
              </span>
              <span style={{ fontSize: '0.72rem', background: '#EEF2FF', color: '#2A3F7E', padding: '1px 6px', borderRadius: '6px', fontWeight: 700 }}>
                {catConfig?.label || primaryCollege.category}
              </span>
              <span style={{ fontSize: '0.72rem', color: '#64748B' }}>
                📍 {primaryCollege.locality}
              </span>
            </div>
          </div>

          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {/* Demo Disclaimer Warning Banner */}
          <div style={{ background: '#fefce8', border: '1px solid #fef08a', padding: '0.85rem', borderRadius: '10px', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
            <ShieldAlert size={20} color="#b45309" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: '0.82rem', color: '#78350f' }}>
              <strong>Demo Listing Status:</strong> {accommodation.demoStatus}. All pricing and locations are realistic models for Kolhapur, but vacancies and phone numbers are non-operational placeholders for hackathon demonstration.
            </div>
          </div>

          {/* Comprehensive Cost Calculation Breakdown */}
          <div style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
              <div>
                <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 700, color: '#64748b' }}>
                  Estimated Recurring Monthly Living Cost
                </span>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  Payable every month during academic semester
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '1.75rem', fontWeight: 800, color: isWithinBudget ? '#1e3a8a' : '#dc2626', fontFamily: 'var(--font-heading)' }}>
                  {formatINR(breakdown.totalMonthly)}
                </span>
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>/mo</span>
              </div>
            </div>

            {/* Itemized Table */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.88rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.2rem 0' }}>
                <span>1. Monthly Room Rent:</span>
                <strong>{formatINR(breakdown.rent)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.2rem 0' }}>
                <span>2. Estimated Utilities (Water, Lights & Inverter):</span>
                <strong>{formatINR(breakdown.utilities)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.2rem 0' }}>
                <span>
                  3. Food & Meals {accommodation.foodIncluded ? '(Included in Stay)' : `(${pairedMess?.name || 'Mess'})`}:
                </span>
                <strong>{accommodation.foodIncluded ? '₹0 (Included)' : formatINR(breakdown.foodCost)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.2rem 0' }}>
                <span>4. Commute Transit Cost ({breakdown.transportMode}):</span>
                <strong>{breakdown.transportCost === 0 ? '₹0 (Walking)' : formatINR(breakdown.transportCost)}</strong>
              </div>
            </div>

            {/* Transparent Calculation String */}
            <div className="formula-badge" style={{ marginTop: '1rem', background: 'white' }}>
              🧮 <strong>Calculation Formula:</strong> {breakdown.formulaText}
            </div>

            {/* One-Time Security Deposit - STRICTLY SEPARATE */}
            <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#92400e' }}>
                    One-Time Security Deposit: {formatINR(breakdown.deposit)}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#b45309' }}>
                    *Refundable upon move-out. Kept separate from your monthly budget comparison.
                  </div>
                </div>
                <span style={{ background: '#fef3c7', padding: '0.25rem 0.6rem', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: 700, color: '#b45309' }}>
                  Non-Recurring
                </span>
              </div>
            </div>
          </div>

          {/* Paired Mess Information if Applicable */}
          {!accommodation.foodIncluded && pairedMess && (
            <div style={{ border: '1px solid #fae8ff', background: '#fdf4ff', borderRadius: '12px', padding: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#86198f', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                <Utensils size={16} />
                <span>Paired Mess Details: {pairedMess.name}</span>
              </div>
              <div style={{ fontSize: '0.85rem', color: '#701a75', lineHeight: 1.5 }}>
                <p><strong>Food Type:</strong> {pairedMess.foodType} • <strong>Price:</strong> {formatINR(pairedMess.monthlyMealPrice)}/month</p>
                <p><strong>Meal Plan:</strong> {pairedMess.mealPlan}</p>
                <p><strong>Sunday Special:</strong> {pairedMess.sundaySpecial}</p>
                <p><strong>Location:</strong> {pairedMess.address}</p>
              </div>
            </div>
          )}

          {/* Live Google Directions & Map from Campus to Stay */}
          <div>
            <h4 style={{ fontSize: '0.95rem', marginBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#1e293b' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2px',
                flexShrink: 0,
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
              }}>
                <img
                  src={primaryCollege.logo}
                  alt={`${primaryCollege.name} logo`}
                  width={28}
                  height={28}
                  style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                />
              </div>
              <span>Campus Commute Map & Directions ({primaryCollege.shortName})</span>
            </h4>
            <DirectionsMap
              college={primaryCollege}
              stay={accommodation}
              listedDistanceKm={distanceToChosenCollege}
            />
          </div>

          {/* Proximity to Kolhapur Engineering Colleges */}
          <div>
            <h4 style={{ fontSize: '0.95rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Building2 size={16} color="#2563eb" />
              Proximity to Kolhapur Colleges
            </h4>
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
              {accommodation.collegesServed.map(cs => {
                const col = collegesData.find(c => c.id === cs.collegeId);
                return (
                  <div key={cs.collegeId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0.85rem', borderBottom: '1px solid #f1f5f9', fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {col && (
                        <img
                          src={col.logo}
                          alt=""
                          width={24}
                          height={24}
                          style={{ width: '24px', height: '24px', objectFit: 'contain', borderRadius: '4px', background: '#FFFFFF', border: '1px solid #E2E8F0', padding: '1px', flexShrink: 0 }}
                        />
                      )}
                      <span>{col?.name || cs.collegeId}</span>
                    </div>
                    <strong style={{ color: cs.distanceKm <= 1.5 ? '#059669' : '#475569' }}>
                      {formatCommute(cs.distanceKm, cs.walkingMinutes)}
                    </strong>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Amenities & Features */}
          <div>
            <h4 style={{ fontSize: '0.95rem', marginBottom: '0.5rem' }}>Amenities & Facilities</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.5rem' }}>
              {accommodation.amenities.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: '#334155' }}>
                  <Check size={14} color="#10b981" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* House Rules */}
          {accommodation.rules && accommodation.rules.length > 0 && (
            <div>
              <h4 style={{ fontSize: '0.95rem', marginBottom: '0.4rem' }}>Stay Policies & Rules</h4>
              <ul style={{ paddingLeft: '1.25rem', fontSize: '0.82rem', color: '#64748b' }}>
                {accommodation.rules.map((rule, idx) => (
                  <li key={idx} style={{ marginBottom: '0.2rem' }}>{rule}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Demo Contact Box */}
          <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '1rem' }}>
            <h4 style={{ fontSize: '0.9rem', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#1e293b' }}>
              <Phone size={15} color="#2563eb" />
              Listing Contact Information (Illustrative Hackathon Preview)
            </h4>
            <p style={{ fontSize: '0.85rem', color: '#334155' }}>
              <strong>Property Representative:</strong> {accommodation.demoContact.ownerName}
            </p>
            <p style={{ fontSize: '0.85rem', color: '#334155' }}>
              <strong>Phone:</strong> {accommodation.demoContact.phone}
            </p>
            <p style={{ fontSize: '0.85rem', color: '#334155' }}>
              <strong>Visiting Hours:</strong> {accommodation.demoContact.timing}
            </p>
            <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '0.4rem', fontStyle: 'italic' }}>
              Note: {accommodation.demoContact.note}
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', justifyContent: 'flex-end', borderBottomLeftRadius: '24px', borderBottomRightRadius: '24px' }}>
          <button className="btn-secondary" onClick={onClose} style={{ padding: '0.55rem 1.25rem' }}>
            Close Breakdown
          </button>
        </div>
      </div>
    </div>
  );
};
