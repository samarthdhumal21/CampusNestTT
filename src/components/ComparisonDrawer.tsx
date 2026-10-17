import React from 'react';
import { RecommendationResult } from '../types';
import { formatINR, formatCommute } from '../utils/formatters';
import { X, Check, ArrowRight } from 'lucide-react';

interface ComparisonDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  comparedResults: RecommendationResult[];
  onRemoveItem: (id: string) => void;
  onClearAll: () => void;
  onOpenDetails: (result: RecommendationResult) => void;
}

export const ComparisonDrawer: React.FC<ComparisonDrawerProps> = ({
  isOpen,
  onClose,
  comparedResults,
  onRemoveItem,
  onClearAll,
  onOpenDetails
}) => {
  if (!isOpen || comparedResults.length === 0) return null;

  return (
    <div className="comparison-drawer">
      <div className="comparison-bar-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <h3 style={{ fontSize: '1.1rem' }}>
            Comparing {comparedResults.length} {comparedResults.length === 1 ? 'Stay' : 'Stays'} Side-by-Side
          </h3>
          <button 
            onClick={onClearAll} 
            style={{ fontSize: '0.8rem', color: '#dc2626', textDecoration: 'underline' }}
          >
            Clear all
          </button>
        </div>
        <button 
          onClick={onClose} 
          className="modal-close-btn" 
          aria-label="Close comparison drawer"
        >
          <X size={18} />
        </button>
      </div>

      <div className="comparison-table-wrapper">
        <table className="comparison-table">
          <thead>
            <tr>
              <th style={{ width: '22%' }}>Feature</th>
              {comparedResults.map(res => (
                <th key={res.id} style={{ width: `${78 / comparedResults.length}%` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 800, color: '#0f172a' }}>{res.accommodation.name}</span>
                    <button 
                      onClick={() => onRemoveItem(res.id)}
                      style={{ color: '#94a3b8', padding: '0 4px', fontSize: '1.1rem' }}
                      title="Remove from comparison"
                    >
                      ×
                    </button>
                  </div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 500, color: '#64748b' }}>
                    {res.accommodation.locality}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Estimated Monthly Total</strong></td>
              {comparedResults.map(res => (
                <td key={res.id}>
                  <strong style={{ fontSize: '1.1rem', color: res.isWithinBudget ? '#1d4ed8' : '#dc2626' }}>
                    {formatINR(res.breakdown.totalMonthly)}/mo
                  </strong>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    {res.isWithinBudget ? 'Within Budget' : `+${formatINR(Math.abs(res.budgetDelta))} over`}
                  </div>
                </td>
              ))}
            </tr>
            <tr>
              <td>Room Rent</td>
              {comparedResults.map(res => (
                <td key={res.id}>{formatINR(res.breakdown.rent)}/mo</td>
              ))}
            </tr>
            <tr>
              <td>Monthly Utilities</td>
              {comparedResults.map(res => (
                <td key={res.id}>{formatINR(res.breakdown.utilities)}/mo</td>
              ))}
            </tr>
            <tr>
              <td>Food / Meal Plan</td>
              {comparedResults.map(res => (
                <td key={res.id}>
                  {res.accommodation.foodIncluded 
                    ? <span style={{ color: '#047857', fontWeight: 600 }}>Included (₹0 extra)</span>
                    : `${formatINR(res.breakdown.foodCost)}/mo (${res.pairedMess?.name || 'Mess'})`
                  }
                </td>
              ))}
            </tr>
            <tr>
              <td>Estimated Commute</td>
              {comparedResults.map(res => (
                <td key={res.id}>
                  {res.breakdown.transportCost === 0 ? '₹0 (Walk)' : `${formatINR(res.breakdown.transportCost)}/mo`}
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                    {formatCommute(res.distanceToChosenCollege)}
                  </div>
                </td>
              ))}
            </tr>
            <tr>
              <td>One-Time Security Deposit</td>
              {comparedResults.map(res => (
                <td key={res.id}>
                  <span style={{ color: '#b45309', fontWeight: 700 }}>
                    {formatINR(res.breakdown.deposit)}
                  </span>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Refundable</div>
                </td>
              ))}
            </tr>
            <tr>
              <td>Room Type</td>
              {comparedResults.map(res => (
                <td key={res.id}>{res.accommodation.type}</td>
              ))}
            </tr>
            <tr>
              <td>Gender Policy</td>
              {comparedResults.map(res => (
                <td key={res.id}>{res.accommodation.genderAllowed}</td>
              ))}
            </tr>
            <tr>
              <td>Key Amenities</td>
              {comparedResults.map(res => (
                <td key={res.id}>
                  <div style={{ fontSize: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                    {res.accommodation.amenities.slice(0, 4).map((a, i) => (
                      <span key={i}>• {a}</span>
                    ))}
                  </div>
                </td>
              ))}
            </tr>
            <tr>
              <td>Actions</td>
              {comparedResults.map(res => (
                <td key={res.id}>
                  <button 
                    className="btn-primary" 
                    style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', width: '100%' }}
                    onClick={() => onOpenDetails(res)}
                  >
                    View Details
                  </button>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
