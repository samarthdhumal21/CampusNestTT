import React, { useState, useMemo, useRef, useEffect } from 'react';
import { SearchPreferences } from '../types';
import { collegesData } from '../data/colleges';
import { COLLEGE_CATEGORIES, getCategoryConfig } from '../config/categories';
import { formatINR } from '../utils/formatters';
import { CollegeLogo } from './CollegeLogo';
import { CollegeSearch } from './CollegeSearch';
import { 
  Sliders, 
  Utensils, 
  Building2, 
  MapPin, 
  Users, 
  IndianRupee, 
  Search, 
  ChevronDown, 
  Check, 
  GraduationCap, 
  ShieldCheck,
  X
} from 'lucide-react';

interface RecommendationWizardProps {
  preferences: SearchPreferences;
  onPreferencesChange: (newPrefs: SearchPreferences) => void;
}

export const RecommendationWizard: React.FC<RecommendationWizardProps> = ({
  preferences,
  onPreferencesChange
}) => {
  const [collegeSearch, setCollegeSearch] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedStream, setSelectedStream] = useState<string>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedCollege = collegesData.find(c => c.id === preferences.collegeId) || collegesData[0];

  const update = (patch: Partial<SearchPreferences>) => {
    onPreferencesChange({ ...preferences, ...patch });
  };

  // Close dropdown when clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter colleges based on Course/Stream filter AND search input
  const filteredColleges = useMemo(() => {
    return collegesData.filter(c => {
      // Stream filter
      if (selectedStream !== 'all') {
        const matchesCategory = c.category === selectedStream;
        const matchesCourses = c.courses && c.courses.some(crs => 
          crs.toLowerCase().includes(selectedStream.toLowerCase())
        );
        if (!matchesCategory && !matchesCourses) return false;
      }

      // Search term
      if (!collegeSearch.trim()) return true;
      const q = collegeSearch.toLowerCase().trim();
      return (
        c.shortName.toLowerCase().includes(q) ||
        c.fullName.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.locality.toLowerCase().includes(q) ||
        c.landmark.toLowerCase().includes(q) ||
        (c.courses && c.courses.some(crs => crs.toLowerCase().includes(q)))
      );
    });
  }, [selectedStream, collegeSearch]);

  // Group filtered colleges by category
  const groupedColleges = useMemo(() => {
    return COLLEGE_CATEGORIES.map(cat => ({
      category: cat,
      colleges: filteredColleges.filter(c => c.category === cat.id)
    })).filter(group => group.colleges.length > 0);
  }, [filteredColleges]);

  // Handle stream change: update selected college if current college doesn't match
  const handleStreamChange = (stream: string) => {
    setSelectedStream(stream);
    if (stream !== 'all') {
      const isCurrentValid = collegesData.some(c => 
        c.id === preferences.collegeId && 
        (c.category === stream || (c.courses && c.courses.some(crs => crs.toLowerCase().includes(stream.toLowerCase()))))
      );
      if (!isCurrentValid) {
        const firstMatch = collegesData.find(c => 
          c.category === stream || (c.courses && c.courses.some(crs => crs.toLowerCase().includes(stream.toLowerCase())))
        );
        if (firstMatch) {
          update({ collegeId: firstMatch.id });
        }
      }
    }
  };

  const budgetPresets = [4500, 6000, 7500, 9500, 12000];

  // Helper for hostel for filter
  const currentHostelFor = preferences.hostelFor || 
    (preferences.gender === 'Girls' ? 'girls' : preferences.gender === 'Boys' ? 'boys' : 'any');

  const handleHostelForChange = (val: 'any' | 'boys' | 'girls') => {
    const genderMapped = val === 'girls' ? 'Girls' : val === 'boys' ? 'Boys' : 'all';
    update({ hostelFor: val, gender: genderMapped });
  };

  const categoryConfig = getCategoryConfig(selectedCollege.category);

  return (
    <div className="wizard-card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sliders size={20} color="#2A3F7E" />
            Budget & Preference Matcher
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
            Select your college, stream, and monthly limit. Results and cost breakdowns update in real time.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', background: '#F8FAFC', padding: '0.35rem 0.75rem', borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: '0.8rem', color: '#475569' }}>
          <div style={{ width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CollegeLogo
              logoUrl={selectedCollege.logo}
              name={selectedCollege.fullName}
              shortName={selectedCollege.shortName}
              size={22}
            />
          </div>
          <span>Focus: <strong>{selectedCollege.shortName}</strong> ({selectedCollege.locality})</span>
          <span style={{ fontSize: '0.72rem', background: '#EEF2FF', color: '#2A3F7E', padding: '1px 6px', borderRadius: '6px', fontWeight: 700 }}>
            {categoryConfig?.label || selectedCollege.category}
          </span>
        </div>
      </div>

      <div className="wizard-grid">
        {/* Stream / Course Filter */}
        <div className="form-group">
          <label className="form-label" htmlFor="stream-filter-select">
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <GraduationCap size={15} color="#2A3F7E" />
              Course / Stream Filter (Optional)
            </span>
          </label>
          <select
            id="stream-filter-select"
            className="form-select"
            value={selectedStream}
            onChange={e => handleStreamChange(e.target.value)}
          >
            <option value="all">All Courses & Streams (34 Colleges)</option>
            <option value="medical">Medical (MBBS, MD/MS, Nursing)</option>
            <option value="engineering">Engineering (B.Tech, M.Tech)</option>
            <option value="pharmacy">Pharmacy (B.Pharm, D.Pharm)</option>
            <option value="arts-science-commerce">Arts / Science / Commerce (BA, B.Sc, B.Com)</option>
            <option value="law">Law (LLB, BA LLB, LLM)</option>
            <option value="management">Management (MBA, MCA, BBA)</option>
            <option value="agriculture">Agriculture (B.Sc Agriculture)</option>
            <option value="diploma">Diploma / Polytechnic</option>
          </select>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
            Narrows down the college selector to your academic branch.
          </span>
        </div>

        {/* Searchable College Dropdown Grouped by Category */}
        <div className="form-group" ref={dropdownRef} style={{ position: 'relative' }}>
          <label className="form-label">
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Building2 size={15} color="#2A3F7E" />
              Target College or Institute ({filteredColleges.length})
            </span>
          </label>

          {/* Quick College Fuzzy Search Bar */}
          <div style={{ marginBottom: '0.5rem' }}>
            <CollegeSearch
              onSelectCollege={(id) => update({ collegeId: id })}
              placeholder="Fuzzy search college, course (MBBS, LLB), or area..."
              autoScrollToMatcher={false}
            />
          </div>

          {/* Trigger Button */}
          <button
            type="button"
            className="college-select-trigger"
            onClick={() => setIsDropdownOpen(prev => !prev)}
            aria-expanded={isDropdownOpen}
            aria-haspopup="listbox"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: 0, flex: 1 }}>
              <div className="trigger-logo-box">
                <CollegeLogo
                  logoUrl={selectedCollege.logo}
                  name={selectedCollege.fullName}
                  shortName={selectedCollege.shortName}
                  size={32}
                />
              </div>
              <div style={{ textAlign: 'left', minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1E293B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {selectedCollege.shortName} — {selectedCollege.name}
                </div>
                <div style={{ fontSize: '0.74rem', color: '#64748B' }}>
                  {selectedCollege.locality} • {categoryConfig?.label}
                </div>
              </div>
            </div>
            <ChevronDown size={18} color="#64748B" style={{ transform: isDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
          </button>

          {/* Searchable Dropdown Menu */}
          {isDropdownOpen && (
            <div className="college-dropdown-menu" role="listbox">
              {/* Search Inside Dropdown */}
              <div className="dropdown-search-wrapper">
                <Search size={14} color="#94A3B8" />
                <input
                  type="text"
                  className="dropdown-search-input"
                  placeholder="Type college name, course, area..."
                  value={collegeSearch}
                  onChange={e => setCollegeSearch(e.target.value)}
                  autoFocus
                />
                {collegeSearch && (
                  <button type="button" onClick={() => setCollegeSearch('')} className="search-clear-btn">
                    <X size={12} />
                  </button>
                )}
              </div>

              {/* Grouped Options List */}
              <div className="dropdown-options-container">
                {groupedColleges.length === 0 ? (
                  <div style={{ padding: '1rem', textAlign: 'center', color: '#64748B', fontSize: '0.85rem' }}>
                    No colleges found matching "{collegeSearch}".
                  </div>
                ) : (
                  groupedColleges.map(group => (
                    <div key={group.category.id} className="dropdown-category-group">
                      <div className="dropdown-category-label">
                        <span>{group.category.label}</span>
                        <span className="dropdown-category-count">({group.colleges.length})</span>
                      </div>

                      {group.colleges.map(c => {
                        const isSelected = c.id === preferences.collegeId;
                        return (
                          <div
                            key={c.id}
                            role="option"
                            aria-selected={isSelected}
                            className={`dropdown-college-option ${isSelected ? 'selected' : ''}`}
                            onClick={() => {
                              update({ collegeId: c.id });
                              setIsDropdownOpen(false);
                            }}
                          >
                            <div className="option-logo-box">
                              <CollegeLogo
                                logoUrl={c.logo}
                                name={c.fullName}
                                shortName={c.shortName}
                                size={32}
                              />
                            </div>

                            <div className="option-info">
                              <div className="option-name-row">
                                <span className="option-shortname">{c.shortName}</span>
                                {c.courses && (
                                  <span className="option-courses-tag">
                                    {c.courses.slice(0, 2).join(', ')}
                                  </span>
                                )}
                              </div>
                              <div className="option-fullname">{c.fullName}</div>
                              <div className="option-locality">📍 {c.locality}</div>
                            </div>

                            {isSelected && (
                              <Check size={16} color="#2A3F7E" strokeWidth={2.5} style={{ marginLeft: 'auto', flexShrink: 0 }} />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
            Landmark: {selectedCollege.landmark}
          </span>
        </div>

        {/* Monthly Budget Input & Slider */}
        <div className="form-group">
          <label className="form-label">
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <IndianRupee size={15} color="#2A3F7E" />
              Monthly Budget (Rent + Food + Utilities + Commute)
            </span>
            <span className="budget-val-badge">
              {formatINR(preferences.monthlyBudget)}
            </span>
          </label>
          <div className="range-container">
            <input
              type="range"
              min={3000}
              max={15000}
              step={250}
              value={preferences.monthlyBudget}
              onChange={e => update({ monthlyBudget: Number(e.target.value) })}
              className="custom-range"
              id="budget-range-input"
            />
            <div className="budget-presets">
              <span style={{ fontSize: '0.72rem', color: '#94a3b8', alignSelf: 'center' }}>Quick:</span>
              {budgetPresets.map(preset => (
                <button
                  key={preset}
                  type="button"
                  className={`preset-chip ${preferences.monthlyBudget === preset ? 'active' : ''}`}
                  onClick={() => update({ monthlyBudget: preset })}
                >
                  {formatINR(preset)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Hostel For Filter (Boys, Girls, Any) */}
        <div className="form-group">
          <label className="form-label">
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Users size={15} color="#2A3F7E" />
              Hostel For (Gender)
            </span>
          </label>
          <div className="segmented-group">
            <button
              type="button"
              className={`segment-btn ${currentHostelFor === 'any' ? 'active' : ''}`}
              onClick={() => handleHostelForChange('any')}
            >
              🤝 Any / Co-ed
            </button>
            <button
              type="button"
              className={`segment-btn ${currentHostelFor === 'boys' ? 'active' : ''}`}
              onClick={() => handleHostelForChange('boys')}
            >
              👨 Boys Hostel
            </button>
            <button
              type="button"
              className={`segment-btn ${currentHostelFor === 'girls' ? 'active' : ''}`}
              onClick={() => handleHostelForChange('girls')}
            >
              👩 Girls Hostel
            </button>
          </div>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
            {currentHostelFor === 'girls' ? 'Restricted strictly to girls-only hostels and ladies PGs.' : currentHostelFor === 'boys' ? 'Showing boys hostels, shared rooms, and bachelor stays.' : 'Shows all verified options regardless of gender restrictions.'}
          </span>
        </div>

        {/* Food Preference */}
        <div className="form-group">
          <label className="form-label">
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Utensils size={15} color="#2A3F7E" />
              Food / Meal Preference
            </span>
          </label>
          <div className="segmented-group">
            <button
              type="button"
              className={`segment-btn ${preferences.foodPreference === 'either' ? 'active' : ''}`}
              onClick={() => update({ foodPreference: 'either' })}
            >
              Either (Best Value)
            </button>
            <button
              type="button"
              className={`segment-btn ${preferences.foodPreference === 'included' ? 'active' : ''}`}
              onClick={() => update({ foodPreference: 'included' })}
            >
              Food Included
            </button>
            <button
              type="button"
              className={`segment-btn ${preferences.foodPreference === 'separate_mess' ? 'active' : ''}`}
              onClick={() => update({ foodPreference: 'separate_mess' })}
            >
              Separate Mess
            </button>
          </div>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
            {preferences.foodPreference === 'included' && 'Only showing stays with built-in meals (zero extra mess cost).'}
            {preferences.foodPreference === 'separate_mess' && 'Pairs rooms with nearby authentic Kolhapuri/Veg student messes.'}
            {preferences.foodPreference === 'either' && 'Evaluates both options and ranks them by lowest total expenditure.'}
          </span>
        </div>

        {/* Accommodation Type */}
        <div className="form-group">
          <label className="form-label" htmlFor="type-select">
            <span>Accommodation Type</span>
          </label>
          <select
            id="type-select"
            className="form-select"
            value={preferences.accommodationType}
            onChange={e => update({ accommodationType: e.target.value })}
          >
            <option value="all">All Room Types (Any)</option>
            <option value="Shared Room (2-Sharing)">Shared Room (2-Sharing)</option>
            <option value="Shared Room (3-Sharing)">Shared Room (3-Sharing)</option>
            <option value="Single Room">Single Room (Private)</option>
            <option value="Student Hostel / PG">Student Hostel / PG</option>
            <option value="1RK / 1BHK Flat">1RK / 1BHK Flat</option>
          </select>
        </div>

        {/* Distance Preference */}
        <div className="form-group">
          <label className="form-label">
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <MapPin size={15} color="#2A3F7E" />
              Max Distance to Campus: {preferences.maxDistanceKm} km
            </span>
          </label>
          <input
            type="range"
            min={1}
            max={15}
            step={0.5}
            value={preferences.maxDistanceKm}
            onChange={e => update({ maxDistanceKm: Number(e.target.value) })}
            className="custom-range"
            id="distance-range-input"
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#94a3b8' }}>
            <span>1 km (Walk)</span>
            <span>5 km (Cycle/Bus)</span>
            <span>15 km (Wide Area)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
