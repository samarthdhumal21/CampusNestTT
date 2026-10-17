import React, { useState, useEffect, useRef } from 'react';
import { College, RecommendationResult } from '../types';
import { 
  getGoogleMaps, 
  isGoogleMapsKeyAvailable, 
  buildGoogleMapsWebUrl 
} from '../services/googleMapsService';
import { formatINR, formatDistance } from '../utils/formatters';
import { MapPin, Navigation, ExternalLink, Info, Building2 } from 'lucide-react';

interface AllStaysMapProps {
  college: College;
  results: RecommendationResult[];
  onOpenDetails: (result: RecommendationResult) => void;
}

export const AllStaysMap: React.FC<AllStaysMapProps> = ({
  college,
  results,
  onOpenDetails
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [activeResult, setActiveResult] = useState<RecommendationResult | null>(
    results.length > 0 ? results[0] : null
  );
  const [useFallback, setUseFallback] = useState(!isGoogleMapsKeyAvailable());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    if (!isGoogleMapsKeyAvailable()) {
      setUseFallback(true);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    getGoogleMaps().then((maps) => {
      if (!isMounted) return;

      if (!maps || !mapContainerRef.current) {
        setUseFallback(true);
        setIsLoading(false);
        return;
      }

      try {
        const map = new maps.Map(mapContainerRef.current, {
          center: { lat: college.latitude, lng: college.longitude },
          zoom: 13,
          mapTypeControl: false,
          streetViewControl: false,
          styles: [
            { featureType: 'poi', stylers: [{ visibility: 'simplified' }] }
          ]
        });

        // 1. College Marker
        const collegeMarker = new maps.Marker({
          position: { lat: college.latitude, lng: college.longitude },
          map,
          title: college.name,
          icon: {
            path: maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: '#2A3F7E',
            fillOpacity: 1,
            strokeColor: '#FFFFFF',
            strokeWeight: 3
          }
        });

        const collegeInfoWindow = new maps.InfoWindow({
          content: `<div style="padding: 6px; font-family: sans-serif;">
            <strong style="color: #2A3F7E;">${college.shortName}</strong><br/>
            <span style="font-size: 12px; color: #64748B;">Target Campus (${college.locality})</span>
          </div>`
        });

        collegeMarker.addListener('click', () => {
          collegeInfoWindow.open(map, collegeMarker);
        });

        // 2. Stay Markers
        const bounds = new maps.LatLngBounds();
        bounds.extend({ lat: college.latitude, lng: college.longitude });

        const infoWindow = new maps.InfoWindow();

        results.forEach((res) => {
          const stay = res.accommodation;
          bounds.extend({ lat: stay.latitude, lng: stay.longitude });

          const marker = new maps.Marker({
            position: { lat: stay.latitude, lng: stay.longitude },
            map,
            title: stay.name,
            icon: {
              path: maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: res.isWithinBudget ? '#059669' : '#B45309',
              fillOpacity: 1,
              strokeColor: '#FFFFFF',
              strokeWeight: 2
            }
          });

          marker.addListener('click', () => {
            setActiveResult(res);
            const content = `
              <div style="padding: 8px; font-family: sans-serif; max-width: 200px;">
                <strong style="color: #23283A; font-size: 13px;">${stay.name}</strong>
                <div style="color: #2A3F7E; font-weight: 800; font-size: 14px; margin: 4px 0;">
                  ${formatINR(res.breakdown.totalMonthly)}/mo
                </div>
                <div style="font-size: 11px; color: #64748B; margin-bottom: 6px;">
                  ${formatDistance(res.distanceToChosenCollege)} from ${college.shortName}
                </div>
                <button id="view-stay-btn-${stay.id}" style="
                  background: #2A3F7E; color: white; border: none; padding: 4px 10px;
                  border-radius: 9999px; font-size: 11px; font-weight: bold; cursor: pointer;
                ">
                  View Details & Directions
                </button>
              </div>
            `;
            infoWindow.setContent(content);
            infoWindow.open(map, marker);

            setTimeout(() => {
              const btn = document.getElementById(`view-stay-btn-${stay.id}`);
              if (btn) {
                btn.onclick = () => onOpenDetails(res);
              }
            }, 100);
          });
        });

        map.fitBounds(bounds);
        setUseFallback(false);
        setIsLoading(false);
      } catch (err) {
        console.warn('All-stays map error:', err);
        setUseFallback(true);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [college, results, onOpenDetails]);

  return (
    <div className="all-stays-map-wrapper">
      <div className="all-stays-map-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Building2 size={16} color="#2A3F7E" />
          <h3 style={{ fontSize: '1.1rem', color: '#23283A' }}>
            Campus Map: {college.shortName} & Recommended Stays
          </h3>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.78rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#2A3F7E' }} />
            <span>Campus</span>
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#059669' }} />
            <span>Within Budget</span>
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#B45309' }} />
            <span>Closest Alternative</span>
          </span>
        </div>
      </div>

      <div className="all-stays-map-body">
        {/* Real Embedded Google Map */}
        <div 
          ref={mapContainerRef} 
          className="all-stays-map-canvas"
          style={{ display: useFallback ? 'none' : 'block' }}
        />

        {/* Fallback Pin Board */}
        {useFallback && (
          <div className="all-stays-fallback-board">
            <div className="fallback-board-header">
              <Info size={16} color="#6E8FC4" />
              <span>
                Interactive Google Map active in fallback mode. Click any stay below to inspect routes and open directions directly in Google Maps.
              </span>
            </div>

            <div className="fallback-pins-grid">
              {results.slice(0, 8).map((res) => {
                const stay = res.accommodation;
                const isSelected = activeResult?.id === res.id;
                const gUrl = buildGoogleMapsWebUrl(
                  college.latitude,
                  college.longitude,
                  stay.latitude,
                  stay.longitude,
                  'WALKING'
                );

                return (
                  <div 
                    key={res.id} 
                    className={`fallback-pin-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => setActiveResult(res)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <strong style={{ fontSize: '0.95rem', color: '#23283A' }}>{stay.name}</strong>
                      <span className={`card-status-badge ${res.isWithinBudget ? 'budget-fit' : 'budget-over'}`}>
                        {formatINR(res.breakdown.totalMonthly)}/mo
                      </span>
                    </div>

                    <div style={{ fontSize: '0.8rem', color: '#64748B', margin: '0.35rem 0' }}>
                      📍 {stay.locality} • {formatDistance(res.distanceToChosenCollege)} from {college.shortName}
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.65rem' }}>
                      <button
                        className="btn-card-action"
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenDetails(res);
                        }}
                      >
                        View Details
                      </button>

                      <a
                        href={gUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="pill-btn-google-maps"
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span>Directions ↗</span>
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="all-stays-map-footer">
        <span>📍 Location coordinates are approximate (demo data). Open Google Maps for turn-by-turn navigation.</span>
      </div>
    </div>
  );
};
