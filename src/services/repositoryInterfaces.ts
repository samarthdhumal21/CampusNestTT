import { AccommodationListing, College, MessListing } from '../types';

/**
 * Clean Repository Interfaces
 * 
 * These interfaces decouple the application and recommendation logic from any
 * specific database. Currently implemented using local seed data (mockDataService),
 * they can be swapped for a Firebase Cloud Firestore service (FirestoreService)
 * with zero modifications to UI components or recommendation algorithms.
 */

export interface ICollegeRepository {
  getAllColleges(): Promise<College[]>;
  getCollegeById(id: string): Promise<College | null>;
}

export interface IAccommodationRepository {
  getAllAccommodations(): Promise<AccommodationListing[]>;
  getAccommodationsByCollege(collegeId: string, maxDistanceKm?: number): Promise<AccommodationListing[]>;
  getAccommodationById(id: string): Promise<AccommodationListing | null>;
}

export interface IMessRepository {
  getAllMesses(): Promise<MessListing[]>;
  getMessesByLocality(locality: string): Promise<MessListing[]>;
  getMessById(id: string): Promise<MessListing | null>;
}
