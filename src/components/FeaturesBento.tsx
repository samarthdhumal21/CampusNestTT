import React from 'react';
import { SectionLabel } from './SectionLabel';
import { Zap, Utensils, BarChart3, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';

export const FeaturesBento: React.FC = () => {
  return (
    <section className="ecoriz-section">
      <div className="section-container">
        <SectionLabel label="Features" />
        <div className="section-heading-group">
          <h2 className="section-main-heading">Smart Features, Budget Driven</h2>
          <p className="section-sub-heading">Calculated specifically for Kolhapur campus clusters</p>
        </div>

        {/* Bento Grid Layout */}
        <div className="bento-grid">
          {/* Card A: Light Gray Card */}
          <div className="bento-card bento-card-light">
            <div className="bento-icon-pill">
              <Zap size={20} color="#2A3F7E" />
            </div>
            <h3 className="bento-card-title">Budget Matching Engine</h3>
            <p className="bento-card-desc">
              Input your exact monthly limit in INR. Our engine dynamically tests real rent, electricity, meal passes, and transit passes to display true budget fits first.
            </p>
            <div className="bento-pill-tags">
              <span className="bento-tag">Zero guesswork</span>
              <span className="bento-tag">Live recalculation</span>
            </div>
          </div>

          {/* Card B: Image / Visual Card with Dark Overlay */}
          <div className="bento-card bento-card-visual">
            <div className="bento-visual-overlay" />
            <div className="bento-visual-content">
              <div className="bento-icon-pill glass-icon">
                <Utensils size={20} color="#FFFFFF" />
              </div>
              <h3 className="bento-card-title text-white">Stay + Mess Pairing</h3>
              <p className="bento-card-desc text-white-80">
                Kolhapur students don't eat in their rooms. We pair rooms in Bawada, Rajarampuri, or Gokul with authentic local bhojanalays serving unlimited thalis.
              </p>
              <div className="bento-pill-tags">
                <span className="bento-tag glass-tag">Pure Veg & Kolhapuri Special</span>
                <span className="bento-tag glass-tag">Dabba delivery</span>
              </div>
            </div>
          </div>

          {/* Card C: Navy Card with Mini Bar Chart Graphic */}
          <div className="bento-card bento-card-navy">
            <div className="bento-icon-pill navy-icon">
              <BarChart3 size={20} color="#A9C8E8" />
            </div>
            <h3 className="bento-card-title text-white">Itemized Cost Breakdown</h3>
            <p className="bento-card-desc text-white-80">
              Rent + Utilities + Food + Transport. Every stay shows its exact mathematical formula so students and parents know every rupee before packing.
            </p>
            
            {/* Visual Mini Bar Graphic */}
            <div className="bento-mini-chart">
              <div className="chart-bar-col">
                <div className="chart-bar" style={{ height: '70%', background: '#A9C8E8' }} />
                <span className="chart-bar-lbl">Rent</span>
              </div>
              <div className="chart-bar-col">
                <div className="chart-bar" style={{ height: '25%', background: '#6E8FC4' }} />
                <span className="chart-bar-lbl">Util</span>
              </div>
              <div className="chart-bar-col">
                <div className="chart-bar" style={{ height: '55%', background: '#A9C8E8' }} />
                <span className="chart-bar-lbl">Mess</span>
              </div>
              <div className="chart-bar-col">
                <div className="chart-bar" style={{ height: '18%', background: '#6E8FC4' }} />
                <span className="chart-bar-lbl">Transit</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
