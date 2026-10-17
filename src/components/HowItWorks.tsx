import React from 'react';
import { SectionLabel } from './SectionLabel';
import { ArrowRight, ChevronRight } from 'lucide-react';

interface HowItWorksProps {
  onFindStayClick: () => void;
}

export const HowItWorks: React.FC<HowItWorksProps> = ({ onFindStayClick }) => {
  const steps = [
    {
      num: '01',
      title: 'Choose your college or institute',
      desc: 'Select from 34 colleges across Medical, Engineering, Arts, Law, Management, and more.'
    },
    {
      num: '02',
      title: 'Set your realistic monthly budget',
      desc: 'Use the INR slider from ₹3,000 to ₹15,000 to define your total monthly living allowance.'
    },
    {
      num: '03',
      title: 'Compare paired stays & local messes',
      desc: 'Evaluate room options matched automatically with verified student bhojanalays.'
    },
    {
      num: '04',
      title: 'See upfront move-in & deposit costs',
      desc: 'Review itemized rent, utilities, mess fees, transit passes, and separate security deposits.'
    }
  ];

  return (
    <section className="ecoriz-section bg-soft-section">
      <div className="section-container">
        <div className="how-it-works-layout">
          {/* Left Column: Heading and CTA */}
          <div className="how-left-col">
            <SectionLabel label="How It Works" />
            <h2 className="section-main-heading" style={{ marginTop: '0.75rem' }}>
              Finding Your Kolhapur Stay in 4 Simple Steps
            </h2>
            <p className="section-sub-heading" style={{ margin: '1rem 0 2rem' }}>
              Built to remove hidden rental surprises so you can focus on your studies from day one.
            </p>
            <button className="pill-btn-ink-cta" onClick={onFindStayClick}>
              <span>Find My Stay</span>
              <span className="pill-icon-circle-light">
                <ArrowRight size={14} />
              </span>
            </button>
          </div>

          {/* Right Column: 4 Clean Rows with Dividers */}
          <div className="how-right-rows">
            {steps.map((step, idx) => (
              <div key={idx} className="how-step-row" onClick={onFindStayClick}>
                <div className="how-step-num">{step.num}</div>
                <div className="how-step-text">
                  <h3 className="how-step-title">{step.title}</h3>
                  <p className="how-step-desc">{step.desc}</p>
                </div>
                <div className="how-step-arrow">
                  <ChevronRight size={18} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
