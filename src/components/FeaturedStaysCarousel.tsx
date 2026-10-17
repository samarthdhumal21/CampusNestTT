import React, { useState } from 'react';
import { SectionLabel } from './SectionLabel';
import { AccommodationListing, RecommendationResult } from '../types';
import { accommodationsData } from '../data/accommodations';
import { formatINR, formatCommute } from '../utils/formatters';
import { ChevronLeft, ChevronRight, MapPin, ArrowRight, ShieldCheck, Check } from 'lucide-react';

interface FeaturedStaysCarouselProps {
  onOpenDetails: (acc: AccommodationListing) => void;
}

export const FeaturedStaysCarousel: React.FC<FeaturedStaysCarouselProps> = ({ onOpenDetails }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const featured = accommodationsData.slice(0, 6);
  const current = featured[currentIndex];

  const handlePrev = () => {
    setCurrentIndex(prev => (prev === 0 ? featured.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex(prev => (prev === featured.length - 1 ? 0 : prev + 1));
  };

  return (
    <section className="ecoriz-section">
      <div className="section-container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
          <div>
            <SectionLabel label="Featured Stays" />
            <h2 className="section-main-heading" style={{ marginTop: '0.75rem' }}>
              Handpicked Student Residencies
            </h2>
            <p className="section-sub-heading">Curated sample options across prime Kolhapur student hubs</p>
          </div>

          {/* Prev / Next Circular Controls */}
          <div className="carousel-nav-buttons">
            <button className="carousel-circle-btn" onClick={handlePrev} aria-label="Previous stay">
              <ChevronLeft size={18} />
            </button>
            <span className="carousel-counter">
              {currentIndex + 1} / {featured.length}
            </span>
            <button className="carousel-circle-btn" onClick={handleNext} aria-label="Next stay">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Rounded Blue-Gradient Carousel Card */}
        <div className="featured-carousel-card">
          <div className="featured-card-inner">
            <div className="featured-card-info">
              <div className="featured-tag-row">
                <span className="featured-type-pill">{current.type}</span>
                <span className="featured-gender-pill">{current.genderAllowed}</span>
                <span className="featured-demo-pill">Illustrative demo</span>
              </div>

              <h3 className="featured-stay-title">{current.name}</h3>

              <div className="featured-locality-row">
                <MapPin size={15} color="#A9C8E8" />
                <span>{current.address}</span>
              </div>

              <p className="featured-highlight-quote">
                "{current.highlight}"
              </p>

              <div className="featured-amenities-row">
                {current.amenities.slice(0, 4).map((a, i) => (
                  <span key={i} className="featured-amenity-chip">
                    <Check size={12} strokeWidth={3} />
                    <span>{a}</span>
                  </span>
                ))}
              </div>
            </div>

            <div className="featured-card-pricing-col">
              <div className="featured-price-box">
                <span className="featured-price-label">Starting Room Rent</span>
                <div className="featured-price-val">
                  {formatINR(current.monthlyRent)}
                  <span className="featured-price-unit">/mo</span>
                </div>
                <div className="featured-deposit-note">
                  One-time Deposit: <strong>{formatINR(current.oneTimeDeposit)}</strong>
                </div>
              </div>

              <button
                className="pill-btn-white-action"
                onClick={() => onOpenDetails(current)}
              >
                <span>View Full Details</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
