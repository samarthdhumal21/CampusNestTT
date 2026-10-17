import React from 'react';

interface SectionLabelProps {
  label: string;
  light?: boolean;
}

export const SectionLabel: React.FC<SectionLabelProps> = ({ label, light = false }) => {
  return (
    <div className={`section-label-pill ${light ? 'light' : ''}`}>
      <span className="section-label-dot" />
      <span>{label}</span>
    </div>
  );
};
