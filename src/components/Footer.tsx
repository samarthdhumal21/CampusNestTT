import React from 'react';
import { Building2, Heart, ShieldAlert, Sparkles, MapPin } from 'lucide-react';
import { collegesData } from '../data/colleges';

interface FooterProps {
  onSelectTab: (tab: 'home' | 'find' | 'explore' | 'about') => void;
  onSelectCollege: (collegeId: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectTab, onSelectCollege }) => {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div>
          <div 
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              background: '#FFFFFF', 
              padding: '0.45rem 0.85rem', 
              borderRadius: '14px', 
              marginBottom: '1rem',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
            }}
          >
            <img
              src="/images/campusnest-logo.png"
              alt="CampusNest Kolhapur"
              style={{ height: '36px', width: 'auto', objectFit: 'contain', display: 'block' }}
            />
          </div>
          <p style={{ fontSize: '0.85rem', lineHeight: 1.6, color: '#94a3b8', marginBottom: '1rem' }}>
            Empowering Kolhapur students and parents with complete cost clarity before shifting to Kolhapur. 
            Pairing verified student stays with local messes since 2026.
          </p>
          <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
            📍 Kolhapur, Maharashtra, India
          </div>
        </div>

        <div>
          <h4 style={{ color: 'white', fontSize: '0.95rem', marginBottom: '0.85rem' }}>Kolhapur Campuses & Institutes</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
            {collegesData.slice(0, 10).map(c => (
              <li key={c.id}>
                <button
                  onClick={() => onSelectCollege(c.id)}
                  style={{ color: '#94a3b8', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  <MapPin size={13} color="#3b82f6" />
                  <span>{c.shortName}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 style={{ color: 'white', fontSize: '0.95rem', marginBottom: '0.85rem' }}>Quick Navigation</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
            <li>
              <button onClick={() => onSelectTab('home')} style={{ color: '#94a3b8' }}>Home</button>
            </li>
            <li>
              <button onClick={() => onSelectTab('find')} style={{ color: '#94a3b8' }}>Find My Stay (Matcher)</button>
            </li>
            <li>
              <button onClick={() => onSelectTab('explore')} style={{ color: '#94a3b8' }}>Explore Accommodations & Messes</button>
            </li>
            <li>
              <button onClick={() => onSelectTab('about')} style={{ color: '#94a3b8' }}>About & Data Transparency</button>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>
          © 2026 CampusNest Kolhapur • Built with <Heart size={13} color="#ef4444" style={{ display: 'inline', verticalAlign: 'middle' }} /> for all Kolhapur students.
        </p>
      </div>
    </footer>
  );
};
