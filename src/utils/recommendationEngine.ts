import { AccommodationListing, MessListing, RecommendationResult, SearchPreferences } from '../types';
import { formatINR } from './formatters';

/**
 * Calculates estimated monthly student transport cost based on distance to college in Kolhapur
 */
export function calculateMonthlyTransport(distanceKm: number): { cost: number; mode: string } {
  if (distanceKm <= 1.0) {
    return { cost: 0, mode: 'Walking (0-10 mins)' };
  }
  if (distanceKm <= 3.0) {
    return { cost: 350, mode: 'Bicycle / Shared Auto' };
  }
  if (distanceKm <= 6.0) {
    return { cost: 800, mode: 'KMT City Bus / Shared Auto' };
  }
  return { cost: 1400, mode: 'Suburban Bus / Two-Wheeler Fuel' };
}

/**
 * Finds the optimal mess to pair with an accommodation based on locality proximity and price
 */
export function findBestPairedMess(
  accommodation: AccommodationListing,
  allMesses: MessListing[]
): MessListing | undefined {
  if (allMesses.length === 0) return undefined;

  // 1. First look for messes in the exact same locality
  const localMesses = allMesses.filter(m => m.locality === accommodation.locality);
  if (localMesses.length > 0) {
    // Pick the most economical or popular in that locality
    return localMesses.sort((a, b) => a.monthlyMealPrice - b.monthlyMealPrice)[0];
  }

  // 2. Otherwise find mess with minimum distance from accommodation's locality
  let bestMess: MessListing | undefined;
  let minDistance = Infinity;

  for (const mess of allMesses) {
    const dist = mess.distanceFromLocalities[accommodation.locality] ?? 99;
    if (dist < minDistance) {
      minDistance = dist;
      bestMess = mess;
    }
  }

  return bestMess || allMesses[0];
}

/**
 * Core Recommendation Engine
 * 
 * Takes user search preferences, candidate accommodations, and messes,
 * then calculates recurring monthly cost = rent + utilities + food + transport.
 * Accurately handles:
 * - Food included (0 added mess cost) vs separate mess pairing
 * - Strict separation of one-time security deposit
 * - Separation of within-budget and over-budget alternatives
 * - Transparent step-by-step formula explanations
 */
export function generateRecommendations(
  preferences: SearchPreferences,
  accommodations: AccommodationListing[],
  messes: MessListing[]
): {
  withinBudget: RecommendationResult[];
  overBudgetAlternatives: RecommendationResult[];
  allRanked: RecommendationResult[];
  totalEvaluated: number;
} {
  const { collegeId, monthlyBudget, foodPreference, accommodationType, maxDistanceKm, gender } = preferences;

  const results: RecommendationResult[] = [];

  for (const acc of accommodations) {
    // 1. Distance check for the selected college
    const collegeDistanceInfo = acc.collegesServed.find(cs => cs.collegeId === collegeId);
    if (!collegeDistanceInfo) continue;

    const distanceKm = collegeDistanceInfo.distanceKm;
    if (distanceKm > maxDistanceKm) continue;

    // 2. Accommodation type filter
    if (accommodationType !== 'all' && acc.type !== accommodationType) {
      continue;
    }

    // 3. Gender / Hostel-For preference filter
    if (gender !== 'all') {
      if (gender === 'Boys' && (acc.genderAllowed === 'Girls' || acc.hostelFor === 'girls')) continue;
      if (gender === 'Girls' && (acc.genderAllowed === 'Boys' || acc.hostelFor === 'boys')) continue;
    }
    if (preferences.hostelFor && preferences.hostelFor !== 'all') {
      const hf = preferences.hostelFor.toLowerCase();
      if (hf === 'boys' && (acc.hostelFor === 'girls' || acc.genderAllowed === 'Girls')) continue;
      if (hf === 'girls' && (acc.hostelFor === 'boys' || acc.genderAllowed === 'Boys')) continue;
    }

    // 4. Food preference filter
    if (foodPreference === 'included' && !acc.foodIncluded) {
      continue;
    }
    if (foodPreference === 'separate_mess' && acc.foodIncluded) {
      continue;
    }

    // 5. Calculate recurring monthly expenses
    const transport = calculateMonthlyTransport(distanceKm);
    let foodCost = 0;
    let pairedMess: MessListing | undefined = undefined;

    if (acc.foodIncluded) {
      foodCost = 0; // Included in accommodation fee
    } else {
      pairedMess = findBestPairedMess(acc, messes);
      foodCost = pairedMess ? pairedMess.monthlyMealPrice : 2400; // fallback standard mess cost
    }

    const rent = acc.monthlyRent;
    const utilities = acc.monthlyUtilities;
    const transportCost = transport.cost;
    const totalMonthly = rent + utilities + foodCost + transportCost;

    // 6. Build itemized formula string
    let formulaText = '';
    if (acc.foodIncluded) {
      formulaText = `Rent ${formatINR(rent)} + utilities ${formatINR(utilities)} + food included ${formatINR(0)} + transport ${formatINR(transportCost)} = estimated ${formatINR(totalMonthly)}/month`;
    } else {
      const messName = pairedMess ? pairedMess.name : 'Mess';
      formulaText = `Rent ${formatINR(rent)} + utilities ${formatINR(utilities)} + mess (${messName}) ${formatINR(foodCost)} + transport ${formatINR(transportCost)} = estimated ${formatINR(totalMonthly)}/month`;
    }

    const budgetDelta = monthlyBudget - totalMonthly;
    const isWithinBudget = budgetDelta >= 0;

    // 7. Match reasons
    const matchReasons: string[] = [];
    if (distanceKm <= 1.0) {
      matchReasons.push(`Walking distance (${distanceKm} km) to college`);
    } else {
      matchReasons.push(`${distanceKm} km from college (${transport.mode})`);
    }

    if (isWithinBudget) {
      if (budgetDelta > 0) {
        matchReasons.push(`Fits your ${formatINR(monthlyBudget)} budget with ${formatINR(budgetDelta)} monthly buffer`);
      } else {
        matchReasons.push(`Exactly matches your ${formatINR(monthlyBudget)} budget`);
      }
    } else {
      matchReasons.push(`Exceeds monthly budget by ${formatINR(Math.abs(budgetDelta))}`);
    }

    if (acc.foodIncluded) {
      matchReasons.push('In-house meal plan saves time and external mess hassles');
    } else if (pairedMess) {
      matchReasons.push(`Paired with ${pairedMess.name} (${pairedMess.foodType})`);
    }

    // 8. Value scoring for ranking
    // Higher score = better fit (higher budget surplus, closer distance, more amenities)
    let valueScore = 100;
    if (isWithinBudget) {
      valueScore += Math.min(budgetDelta / 100, 50); // bonus for savings
    } else {
      valueScore -= Math.abs(budgetDelta) / 50; // penalty for exceeding
    }
    valueScore += Math.max(0, (10 - distanceKm) * 5); // proximity bonus
    valueScore += acc.amenities.length * 3; // amenities bonus

    results.push({
      id: `${acc.id}-${pairedMess?.id || 'food-inc'}`,
      accommodation: acc,
      pairedMess,
      distanceToChosenCollege: distanceKm,
      breakdown: {
        rent,
        utilities,
        foodCost,
        transportCost,
        transportMode: transport.mode,
        totalMonthly,
        deposit: acc.oneTimeDeposit,
        formulaText
      },
      isWithinBudget,
      budgetDelta,
      matchReasons,
      valueScore
    });
  }

  // Split results into within budget and over budget
  const withinBudget = results
    .filter(r => r.isWithinBudget)
    .sort((a, b) => b.valueScore - a.valueScore);

  const overBudgetAlternatives = results
    .filter(r => !r.isWithinBudget)
    // For over budget, sort by closest to budget (least over-budget first)
    .sort((a, b) => Math.abs(a.budgetDelta) - Math.abs(b.budgetDelta));

  const allRanked = [...withinBudget, ...overBudgetAlternatives];

  return {
    withinBudget,
    overBudgetAlternatives,
    allRanked,
    totalEvaluated: results.length
  };
}
