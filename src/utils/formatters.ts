/**
 * Formats numbers into Indian Rupee (INR) representation with currency symbol
 * Example: formatINR(6400) => "₹6,400"
 */
export function formatINR(amount: number): string {
  if (isNaN(amount)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
}

/**
 * Formats distance with appropriate precision
 * Example: formatDistance(0.6) => "0.6 km"
 */
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
}

/**
 * Formats commute time into user-friendly text
 */
export function formatCommute(distanceKm: number, walkingMinutes?: number): string {
  if (distanceKm <= 1.0) {
    const mins = walkingMinutes || Math.round(distanceKm * 13);
    return `${mins} min walk (${formatDistance(distanceKm)})`;
  }
  if (distanceKm <= 3.0) {
    return `~8-12 min by bicycle / auto (${formatDistance(distanceKm)})`;
  }
  if (distanceKm <= 6.0) {
    return `~15-20 min KMT bus / 6-seater (${formatDistance(distanceKm)})`;
  }
  return `~25-35 min transit / bus (${formatDistance(distanceKm)})`;
}
