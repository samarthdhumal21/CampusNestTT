import React, { useState, useEffect, useRef } from 'react';
import { College, AccommodationListing } from '../types';
import { 
  getGoogleMaps, 
  isGoogleMapsKeyAvailable, 
  buildGoogleMapsWebUrl, 
  TravelModeOption 
} from '../services/googleMapsService';
import { 
  Navigation, 
  MapPin, 
  ExternalLink, 
  Footprints, 
  Car, 
  Bus, 
  AlertCircle, 
  Clock, 
  Info,
  Compass
} from 'lucide-react';
import { formatDistance } from '../utils/formatters';

interface DirectionsMapProps {
  college: College;
  stay: AccommodationListing;
  listedDistanceKm?: number;
  compact?: boolean;
}

export const DirectionsMap: React.FC<DirectionsMapProps> = ({
  college,
  stay,
  listedDistanceKm,
  compact = false
}) => {
  // Determine initial mode: Walking if <= 2km, else Driving
  const initialDistance = listedDistanceKm ?? 
    (stay.collegesServed.find(cs => cs.collegeId === college.id)?.distanceKm ?? 3.0);

  const [travelMode, setTravelMode] = useState<TravelModeOption>(
    initialDistance <= 2.0 ? 'WALKING' : 'DRIVING'
  );

  const [isLoading, setIsLoading] = useState(true);
  const [useFallback, setUseFallback] = useState(!isGoogleMapsKeyAvailable());
  const [routeInfo, setRouteInfo] = useState<{
    distanceText: string;
    durationText: string;
    routeDistanceKm?: number;
  } | null>(null);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);

  // Fallback estimates for when API key is not present
  const estimateFallbackTime = (distKm: number, mode: TravelModeOption): string => {
    if (mode === 'WALKING') {
      const mins = Math.max(2, Math.round(distKm * 13));
      return `${mins} min walk`;
    }
    if (mode === 'DRIVING') {
      const mins = Math.max(3, Math.round(distKm * 3.5));
      return `${mins} min by two-wheeler / auto`;
    }
    const mins = Math.max(6, Math.round(distKm * 4.5));
    return `${mins} min by KMT city bus`;
  };

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
        // Initialize Map centered between college and stay
        const centerLat = (college.latitude + stay.latitude) / 2;
        const centerLng = (college.longitude + stay.longitude) / 2;

        if (!mapInstanceRef.current) {
          mapInstanceRef.current = new maps.Map(mapContainerRef.current, {
            center: { lat: centerLat, lng: centerLng },
            zoom: 13,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: true,
            styles: [
              { featureType: 'poi', stylers: [{ visibility: 'simplified' }] }
            ]
          });

          directionsRendererRef.current = new maps.DirectionsRenderer({
            map: mapInstanceRef.current,
            suppressMarkers: false,
            polylineOptions: {
              strokeColor: '#2A3F7E',
              strokeWeight: 5,
              strokeOpacity: 0.85
            }
          });
        }

        const directionsService = new maps.DirectionsService();
        const gTravelMode = 
          travelMode === 'WALKING' ? maps.TravelMode.WALKING :
          travelMode === 'DRIVING' ? maps.TravelMode.DRIVING :
          maps.TravelMode.TRANSIT;

        directionsService.route(
          {
            origin: { lat: college.latitude, lng: college.longitude },
            destination: { lat: stay.latitude, lng: stay.longitude },
            travelMode: gTravelMode
          },
          (result, status) => {
            if (!isMounted) return;
            setIsLoading(false);

            if (status === maps.DirectionsStatus.OK && result) {
              directionsRendererRef.current?.setDirections(result);
              const leg = result.routes[0]?.legs[0];
              if (leg) {
                setRouteInfo({
                  distanceText: leg.distance?.text || '',
                  durationText: leg.duration?.text || '',
                  routeDistanceKm: (leg.distance?.value || 0) / 1000
                });
              }
              setUseFallback(false);
            } else {
              console.warn('Google Maps Directions returned status:', status);
              setUseFallback(true);
            }
          }
        );
      } catch (err) {
        console.warn('Map initialization error:', err);
        setUseFallback(true);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [college, stay, travelMode]);

  const webDirectionsUrl = buildGoogleMapsWebUrl(
    college.latitude,
    college.longitude,
    stay.latitude,
    stay.longitude,
    travelMode
  );

  return (
    <div className={`directions-map-card ${compact ? 'compact' : ''}`}>
      {/* Top Controls Header */}
      <div className="directions-map-header">
        <div className="directions-title-group">
          <div className="directions-icon-pill">
            <Navigation size={15} color="#2A3F7E" />
          </div>
          <div>
            <span className="directions-label">Campus Commute Route</span>
            <div className="directions-endpoints">
              <span className="endpoint-name">{college.shortName}</span>
              <span className="endpoint-arrow">→</span>
              <span className="endpoint-name">{stay.name}</span>
            </div>
          </div>
        </div>

        {/* Travel Mode Selector Buttons */}
        <div className="travel-mode-pill-group">
          <button
            type="button"
            className={`travel-mode-btn ${travelMode === 'WALKING' ? 'active' : ''}`}
            onClick={() => setTravelMode('WALKING')}
            title="Walking mode"
          >
            <Footprints size={14} />
            <span>Walk</span>
          </button>
          <button
            type="button"
            className={`travel-mode-btn ${travelMode === 'DRIVING' ? 'active' : ''}`}
            onClick={() => setTravelMode('DRIVING')}
            title="Two-wheeler / Driving mode"
          >
            <Car size={14} />
            <span>Bike/Auto</span>
          </button>
          <button
            type="button"
            className={`travel-mode-btn ${travelMode === 'TRANSIT' ? 'active' : ''}`}
            onClick={() => setTravelMode('TRANSIT')}
            title="City Bus / Transit mode"
          >
            <Bus size={14} />
            <span>Bus</span>
          </button>
        </div>
      </div>

      {/* Map Display or Loading Skeleton or Fallback */}
      <div className="map-view-viewport">
        {/* Real Embedded Google Map Container */}
        <div 
          ref={mapContainerRef} 
          className="google-map-render-target"
          style={{ display: useFallback ? 'none' : 'block' }}
        />

        {/* Skeleton while Loading */}
        {isLoading && !useFallback && (
          <div className="map-loading-skeleton">
            <div className="skeleton-spinner" />
            <span>Calculating Google Maps route...</span>
          </div>
        )}

        {/* Fallback View (When no key or request fails) */}
        {useFallback && (
          <div className="map-fallback-view">
            <div className="fallback-route-graphic">
              <div className="route-node college-node">
                <img
                  src={college.logo}
                  alt=""
                  width={24}
                  height={24}
                  style={{ width: '24px', height: '24px', objectFit: 'contain', background: '#FFFFFF', borderRadius: '4px', border: '1px solid #E2E8F0', padding: '1px', flexShrink: 0 }}
                />
                <div className="node-text">
                  <strong>{college.shortName}</strong>
                  <span>{college.locality}</span>
                </div>
              </div>

              <div className="route-line-connector">
                <span className="route-line-dash" />
                <span className="route-dist-tag">
                  {travelMode === 'WALKING' ? '🚶‍♂️' : travelMode === 'DRIVING' ? '🛵' : '🚌'}{' '}
                  {formatDistance(initialDistance)}
                </span>
                <span className="route-line-dash" />
              </div>

              <div className="route-node stay-node">
                <MapPin size={18} color="#059669" />
                <div className="node-text">
                  <strong>{stay.name}</strong>
                  <span>{stay.locality}</span>
                </div>
              </div>
            </div>

            <div className="fallback-note-row">
              <Info size={14} color="#6E8FC4" style={{ flexShrink: 0 }} />
              <span>
                Location is approximate (demo data). Open Google Maps below for real-time live navigation.
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Route Distance, Time & Comparison Transparency Strip */}
      <div className="directions-stats-bar">
        <div className="stats-metric-group">
          {routeInfo ? (
            <>
              <div className="metric-item">
                <span className="metric-lbl">Route Distance:</span>
                <strong className="metric-val">{routeInfo.distanceText}</strong>
              </div>
              <div className="metric-item">
                <span className="metric-lbl">Travel Time:</span>
                <strong className="metric-val">{routeInfo.durationText}</strong>
              </div>
            </>
          ) : (
            <>
              <div className="metric-item">
                <span className="metric-lbl">Listed Distance:</span>
                <strong className="metric-val">{formatDistance(initialDistance)}</strong>
              </div>
              <div className="metric-item">
                <span className="metric-lbl">Estimated Commute:</span>
                <strong className="metric-val">{estimateFallbackTime(initialDistance, travelMode)}</strong>
              </div>
            </>
          )}

          {routeInfo && listedDistanceKm && (
            <div className="metric-item subtle">
              <span className="metric-lbl">Listed Distance:</span>
              <span className="metric-val">{formatDistance(listedDistanceKm)}</span>
            </div>
          )}
        </div>

        {/* External Google Maps Button (100% works without API Key) */}
        <a
          href={webDirectionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="pill-btn-google-maps"
          title="Open step-by-step route in Google Maps app"
        >
          <span>Get directions in Google Maps</span>
          <ExternalLink size={14} />
        </a>
      </div>
    </div>
  );
};
