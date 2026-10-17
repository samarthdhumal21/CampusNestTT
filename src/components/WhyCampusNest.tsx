import React from 'react';
import { SectionLabel } from './SectionLabel';
import { ShieldCheck, IndianRupee, Layers, Sparkles, Quote } from 'lucide-react';

export const WhyCampusNest: React.FC = () => {
  return (
    <section className="ecoriz-section bg-soft-section">
      <div className="section-container">
        {/* Centered Heading */}
        <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 3rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.75rem' }}>
            <SectionLabel label="Why CampusNest" />
          </div>
          <h2 className="section-main-heading">
            Student Living Doesn't Have To Be Complicated
          </h2>
          <p className="section-sub-heading">
            Built by engineers to bring clarity, transparency, and accurate numbers to student budgeting.
          </p>
        </div>

        {/* 3 Pillars Cards */}
        <div className="why-cards-grid">
          <div className="why-card">
            <div className="why-icon-pill">
              <IndianRupee size={22} color="#2A3F7E" />
            </div>
            <h3 className="why-card-title">Transparent Pricing</h3>
            <p className="why-card-desc">
              Every card shows room rent, electricity/water utilities, mess food costs, and campus commute transit broken down down to the single rupee.
            </p>
          </div>

          <div className="why-card">
            <div className="why-icon-pill">
              <Layers size={22} color="#2A3F7E" />
            </div>
            <h3 className="why-card-title">Deposit Shown Separately</h3>
            <p className="why-card-desc">
              One-time move-in deposits are kept strictly isolated from monthly recurring checks so parents never confuse setup capital with monthly allowances.
            </p>
          </div>

          <div className="why-card">
            <div className="why-icon-pill">
              <ShieldCheck size={22} color="#2A3F7E" />
            </div>
            <h3 className="why-card-title">Honest Demo Labels</h3>
            <p className="why-card-desc">
              Zero fake ratings, zero artificial hype, and zero fabricated phone numbers. All demo data is marked honestly as illustrative hackathon models.
            </p>
          </div>
        </div>

        {/* Navy Trust & Why We Built This Block */}
        <div className="navy-trust-block">
          <div className="trust-block-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Quote size={20} color="#A9C8E8" />
              <span className="trust-badge">Why We Built This • Student Perspectives</span>
            </div>
          </div>

          <div className="trust-quotes-grid">
            <div className="trust-quote-item">
              <p className="trust-quote-text">
                "When I arrived in Kolhapur from Sangli, my room rent was ₹3,200, but paying for a separate mess (₹2,500) and city auto transit (₹800) broke my monthly allowance. CampusNest calculates the realistic all-inclusive number before you travel."
              </p>
              <div className="trust-author">
                <span className="author-name">Sample Fresher Scenario</span>
                <span className="author-sub">1st Year Student, Kasaba Bawada</span>
              </div>
            </div>

            <div className="trust-quote-item">
              <p className="trust-quote-text">
                "For parents sending children to another city for college, knowing the exact one-time security deposit upfront alongside recurring mess fees makes planning family savings effortless and stress-free."
              </p>
              <div className="trust-author">
                <span className="author-name">Sample Parent Perspective</span>
                <span className="author-sub">College Admission Planning</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
