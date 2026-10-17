import { Loader } from '@googlemaps/js-api-loader';

let loaderInstance: Loader | null = null;
let mapsPromise: Promise<typeof google.maps | null> | null = null;

export const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

export const isGoogleMapsKeyAvailable = (): boolean => {
  return !!GOOGLE_MAPS_API_KEY && 
         GOOGLE_MAPS_API_KEY.trim() !== '' && 
         !GOOGLE_MAPS_API_KEY.includes('your_google_maps_api_key_here');
};

/**
 * Loads the Google Maps JavaScript API safely using @googlemaps/js-api-loader.
 * Returns null if the API key is not configured or if loading fails.
 */
export async function getGoogleMaps(): Promise<typeof google.maps | null> {
  if (!isGoogleMapsKeyAvailable()) {
    return null;
  }

  if (!mapsPromise) {
    if (!loaderInstance) {
      loaderInstance = new Loader({
        apiKey: GOOGLE_MAPS_API_KEY,
        version: 'weekly',
        libraries: ['places', 'geometry']
      });
    }

    mapsPromise = loaderInstance.load()
      .then((googleInstance) => {
        return googleInstance.maps;
      })
      .catch((err) => {
        console.warn('Google Maps API failed to load:', err);
        return null;
      });
  }

  return mapsPromise;
}

export type TravelModeOption = 'WALKING' | 'DRIVING' | 'BICYCLING' | 'TRANSIT';

/**
 * Builds standard Google Maps web directions URL that opens directly in a new browser tab.
 * Does not require an API key and works on all devices and browsers.
 */
export function buildGoogleMapsWebUrl(
  originLat: number,
  originLng: number,
  destLat: number,
  destLng: number,
  travelMode: TravelModeOption = 'WALKING'
): string {
  const modeParamMap: Record<TravelModeOption, string> = {
    WALKING: 'walking',
    DRIVING: 'driving',
    BICYCLING: 'bicycling',
    TRANSIT: 'transit'
  };

  const mode = modeParamMap[travelMode] || 'walking';
  return `https://www.google.com/maps/dir/?api=1&origin=${originLat},${originLng}&destination=${destLat},${destLng}&travelmode=${mode}`;
}
