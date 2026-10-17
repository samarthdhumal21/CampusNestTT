import { AccommodationListing, College, MessListing } from '../types';
import { collegesData } from '../data/colleges';
import { accommodationsData } from '../data/accommodations';
import { messesData } from '../data/messes';
import { IAccommodationRepository, ICollegeRepository, IMessRepository } from './repositoryInterfaces';

class MockCollegeService implements ICollegeRepository {
  async getAllColleges(): Promise<College[]> {
    // Simulated micro-delay for realistic async promise resolution
    return Promise.resolve([...collegesData]);
  }

  async getCollegeById(id: string): Promise<College | null> {
    const college = collegesData.find(c => c.id === id);
    return Promise.resolve(college || null);
  }
}

class MockAccommodationService implements IAccommodationRepository {
  async getAllAccommodations(): Promise<AccommodationListing[]> {
    return Promise.resolve([...accommodationsData]);
  }

  async getAccommodationsByCollege(collegeId: string, maxDistanceKm?: number): Promise<AccommodationListing[]> {
    const filtered = accommodationsData.filter(acc => {
      const distanceObj = acc.collegesServed.find(cs => cs.collegeId === collegeId);
      if (!distanceObj) return false;
      if (maxDistanceKm !== undefined && distanceObj.distanceKm > maxDistanceKm) return false;
      return true;
    });
    return Promise.resolve(filtered);
  }

  async getAccommodationById(id: string): Promise<AccommodationListing | null> {
    const acc = accommodationsData.find(a => a.id === id);
    return Promise.resolve(acc || null);
  }
}

class MockMessService implements IMessRepository {
  async getAllMesses(): Promise<MessListing[]> {
    return Promise.resolve([...messesData]);
  }

  async getMessesByLocality(locality: string): Promise<MessListing[]> {
    const filtered = messesData.filter(m => m.locality === locality);
    return Promise.resolve(filtered);
  }

  async getMessById(id: string): Promise<MessListing | null> {
    const mess = messesData.find(m => m.id === id);
    return Promise.resolve(mess || null);
  }
}

export const collegeService = new MockCollegeService();
export const accommodationService = new MockAccommodationService();
export const messService = new MockMessService();
