import React, { useState } from 'react';
import type { College } from '../types';

interface CollegeLogoProps {
  college?: College;
  logoUrl?: string;
  name?: string;
  shortName?: string;
  className?: string;
  size?: number; // width/height in px
  alt?: string;
  loading?: 'lazy' | 'eager';
  monogramSize?: 'sm' | 'md' | 'lg';
}

/**
 * Extracts 2-3 clean uppercase initials for the monogram badge fallback
 */
export function getMonogramInitials(shortName: string): string {
  if (!shortName) return 'CN';
  const clean = shortName.trim().replace(/[^a-zA-Z0-9\s]/g, '');
  const words = clean.split(/\s+/).filter(Boolean);
  
  if (words.length >= 3) {
    return (words[0][0] + words[1][0] + words[2][0]).toUpperCase();
  }
  if (words.length === 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  if (clean.length <= 4) {
    return clean.toUpperCase();
  }
  return clean.slice(0, 3).toUpperCase();
}

export const CollegeLogo: React.FC<CollegeLogoProps> = ({
  college,
  logoUrl,
  name,
  shortName,
  className = '',
  size,
  alt = '',
  loading = 'lazy'
}) => {
  const [hasError, setHasError] = useState(false);
  
  const effectiveLogoUrl = logoUrl || college?.logo || '';
  const effectiveName = name || college?.fullName || college?.name || '';
  const effectiveShortName = shortName || college?.shortName || '';
  
  const initials = getMonogramInitials(effectiveShortName);

  if (hasError || !effectiveLogoUrl) {
    return (
      <div
        className={`college-monogram-badge ${className}`}
        style={size ? { width: `${size}px`, height: `${size}px` } : undefined}
        title={`${effectiveName} (${effectiveShortName})`}
        aria-label={`${effectiveShortName} monogram`}
      >
        <span className="monogram-text">{initials}</span>
      </div>
    );
  }

  return (
    <img
      src={effectiveLogoUrl}
      alt={alt || `${effectiveShortName} logo`}
      loading={loading}
      width={size || 120}
      height={size || 56}
      className={`college-logo-img ${className}`}
      style={size ? { maxWidth: `${size}px`, maxHeight: `${size}px`, objectFit: 'contain' } : undefined}
      onError={() => setHasError(true)}
    />
  );
};
