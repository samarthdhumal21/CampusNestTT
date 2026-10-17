import { CollegeCategoryId } from '../config/categories';

export type AccommodationType = 
  | 'Single Room'
  | 'Shared Room (2-Sharing)'
  | 'Shared Room (3-Sharing)'
  | '1RK / 1BHK Flat'
  | 'Student Hostel / PG';

export type GenderAllowed = 'Boys' | 'Girls' | 'Co-ed / Any';

export type HostelFor = 'boys' | 'girls' | 'any';

export interface CollegeDistance {
  collegeId: string;
  distanceKm: number;
  walkingMinutes: number;
}

export interface AccommodationListing {
  id: string;
  name: string;
  type: AccommodationType;
  locality: string;
  address: string;
  monthlyRent: number;
  monthlyUtilities: number;
  oneTimeDeposit: number;
  collegesServed: CollegeDistance[];
  amenities: string[];
  foodIncluded: boolean;
  foodIncludedNotes?: string;
  genderAllowed: GenderAllowed;
  hostelFor: HostelFor;
  demoStatus: string; // e.g. "Demo Listing • Illustrative Data"
  lastUpdated?: string;
  demoContact: {
    ownerName: string;
    phone: string;
    timing: string;
    note: string;
  };
  latitude: number;
  longitude: number;
  rules: string[];
  highlight: string;
  roomFeatures: string[];
}

export type FoodType = 'Pure Veg' | 'Veg & Non-Veg' | 'Kolhapuri Special (Veg & Non-Veg)';

export interface MessListing {
  id: string;
  name: string;
  locality: string;
  address: string;
  latitude: number;
  longitude: number;
  monthlyMealPrice: number;
  foodType: FoodType;
  mealPlan: string;
  tiffinAvailable: boolean;
  sundaySpecial: string;
  distanceFromLocalities: Record<string, number>; // distance in km from localities
  collegesNearby: { collegeId: string; distanceKm: number }[];
  demoStatus: string;
  lastUpdated?: string;
  demoContact: {
    managerName: string;
    phone: string;
    timing: string;
    note: string;
  };
  specialties: string[];
}

export interface College {
  id: string;
  name: string;
  fullName: string;
  shortName: string;
  category: CollegeCategoryId;
  locality: string;
  landmark: string;
  latitude: number;
  longitude: number;
  popularStreams?: string[];
  courses?: string[];
  establishedYear?: number;
  description?: string;
  logo: string;
}

export interface SearchPreferences {
  collegeId: string;
  monthlyBudget: number;
  foodPreference: 'either' | 'included' | 'separate_mess';
  accommodationType: string; // 'all' or specific type
  maxDistanceKm: number;
  gender: string; // 'all' | 'Boys' | 'Girls'
  hostelFor?: 'boys' | 'girls' | 'any' | 'all';
  course?: string; // optional stream/course filter
  category?: string; // optional category filter
}

export interface ItemizedBreakdown {
  rent: number;
  utilities: number;
  foodCost: number;
  transportCost: number;
  transportMode: string;
  totalMonthly: number;
  deposit: number;
  formulaText: string;
}

export interface RecommendationResult {
  id: string;
  accommodation: AccommodationListing;
  pairedMess?: MessListing;
  distanceToChosenCollege: number;
  breakdown: ItemizedBreakdown;
  isWithinBudget: boolean;
  budgetDelta: number; // monthlyBudget - totalMonthly (positive = within budget, negative = over budget)
  matchReasons: string[];
  valueScore: number;
}

export type UserRole = 'student' | 'owner' | 'admin';

export type OwnerType = 'pg' | 'hostel' | 'mess';

export type OwnerStatus = 'none' | 'pending' | 'approved' | 'rejected';

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
  role: UserRole;
  ownerType: OwnerType | null;
  ownerStatus: OwnerStatus;
  createdAt: string;
}

export interface ShortlistItem {
  listingId: string;
  addedAt: string;
  notes?: string;
}

export type OwnerListingStatus = 'pending review' | 'approved' | 'rejected' | 'hidden';

export interface OwnerListingSubmission {
  id: string;
  ownerId: string;
  ownerType?: OwnerType;
  name: string;
  type?: AccommodationType;
  locality: string;
  monthlyRent?: number;
  monthlyUtilities?: number;
  oneTimeDeposit?: number;
  monthlyMealPrice?: number;
  foodType?: FoodType;
  collegesServed: { collegeId: string; distanceKm: number }[];
  amenities?: string[];
  hostelFor?: HostelFor;
  status: OwnerListingStatus;
  verificationBadge: 'owner-submitted, not verified' | 'verified';
  createdAt: string;
  lastUpdated?: string;
}

