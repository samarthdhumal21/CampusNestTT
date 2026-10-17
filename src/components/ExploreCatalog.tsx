import React, { useState, useMemo } from 'react';
import { AccommodationListing, MessListing } from '../types';
import { accommodationsData } from '../data/accommodations';
import { messesData } from '../data/messes';
import { collegesData } from '../data/colleges';
import { COLLEGE_CATEGORIES } from '../config/categories';
import { CollegeSearch } from './CollegeSearch';
import { formatINR } from '../utils/formatters';
import { 
  Search, 
  MapPin, 
  Utensils, 
  Building2, 
  Filter, 
  Info, 
  Check, 
  ShieldAlert, 
  Coffee,
  GraduationCap,
  Users
} from 'lucide-react';

interface ExploreCatalogProps {
  onOpenAccommodationDetails: (acc: AccommodationListing) => void;
}

export const ExploreCatalog: React.FC<ExploreCatalogProps> = ({ onOpenAccommodationDetails }) => {
  const [activeTab, setActiveTab] = useState<'accommodations' | 'messes'>('accommodations');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLocality, setSelectedLocality] = useState('all');
  const [selectedCollege, setSelectedCollege] = useState('all');
  const [selectedHostelFor, setSelectedHostelFor] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedFoodType, setSelectedFoodType] = useState('all');

  const localities = useMemo(() => {
    const set = new Set<string>();
    accommodationsData.forEach(a => set.add(a.locality));
    messesData.forEach(m => set.add(m.locality));
    return Array.from(set).sort();
  }, []);

  const filteredAccommodations = useMemo(() => {
    return accommodationsData.filter(item => {
      // 1. Search text
      const q = searchQuery.toLowerCase().trim();
      const matchSearch = !q || 
        item.name.toLowerCase().includes(q) ||
        item.address.toLowerCase().includes(q) ||
        item.locality.toLowerCase().includes(q) ||
        item.amenities.some(a => a.toLowerCase().includes(q));

      // 2. Locality filter
      const matchLocality = selectedLocality === 'all' || item.locality === selectedLocality;

      // 3. College filter
      const matchCollege = selectedCollege === 'all' || item.collegesServed.some(cs => cs.collegeId === selectedCollege);

      // 4. College category filter
      const matchCategory = selectedCategory === 'all' || item.collegesServed.some(cs => {
        const col = collegesData.find(c => c.id === cs.collegeId);
        return col && col.category === selectedCategory;
      });

      // 5. Stay type filter
      const matchType = selectedType === 'all' || item.type === selectedType;

      // 6. Hostel For filter
      let matchHostelFor = true;
      if (selectedHostelFor === 'boys') {
        matchHostelFor = item.hostelFor === 'boys' || item.genderAllowed === 'Boys' || item.genderAllowed === 'Co-ed / Any';
      } else if (selectedHostelFor === 'girls') {
        matchHostelFor = item.hostelFor === 'girls' || item.genderAllowed === 'Girls';
      }

      return matchSearch && matchLocality && matchCollege && matchCategory && matchType && matchHostelFor;
    });
  }, [searchQuery, selectedLocality, selectedCollege, selectedCategory, selectedType, selectedHostelFor]);

  const filteredMesses = useMemo(() => {
    return messesData.filter(item => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch = !q || 
        item.name.toLowerCase().includes(q) ||
        item.address.toLowerCase().includes(q) ||
        item.locality.toLowerCase().includes(q) ||
        item.specialties.some(s => s.toLowerCase().includes(q));

      const matchLocality = selectedLocality === 'all' || item.locality === selectedLocality;
      const matchCollege = selectedCollege === 'all' || item.collegesNearby.some(cn => cn.collegeId === selectedCollege);

      const matchCategory = selectedCategory === 'all' || item.collegesNearby.some(cn => {
        const col = collegesData.find(c => c.id === cn.collegeId);
        return col && col.category === selectedCategory;
      });

      const matchFood = selectedFoodType === 'all' || item.foodType === selectedFoodType;

      return matchSearch && matchLocality && matchCollege && matchCategory && matchFood;
    });
  }, [searchQuery, selectedLocality, selectedCollege, selectedCategory, selectedFoodType]);

  return (
    <div className="section-wrapper">
      <div className="section-header">
        <h2 className="section-title">Explore Kolhapur Student Listings</h2>
        <p className="section-desc">
          Browse all {accommodationsData.length} verified demo accommodation options and {messesData.length} authentic student messes across Kolhapur.
        </p>
      </div>

      {/* Explore Tabs */}
      <div className="explore-tabs">
        <button
          className={`explore-tab-btn ${activeTab === 'accommodations' ? 'active' : ''}`}
          onClick={() => setActiveTab('accommodations')}
        >
          <Building2 size={18} style={{ marginRight: '6px', verticalAlign: 'text-bottom' }} />
          Accommodations & PGs ({filteredAccommodations.length})
        </button>
        <button
          className={`explore-tab-btn ${activeTab === 'messes' ? 'active' : ''}`}
          onClick={() => setActiveTab('messes')}
        >
          <Utensils size={18} style={{ marginRight: '6px', verticalAlign: 'text-bottom' }} />
          Student Messes & Bhojanalays ({filteredMesses.length})
        </button>
      </div>

      {/* Quick College Fuzzy Search */}
      <div style={{ marginBottom: '0.75rem', maxWidth: '420px' }}>
        <CollegeSearch
          onSelectCollege={(id) => setSelectedCollege(id)}
          placeholder="Filter by college name, course (MBBS, Law), or area..."
          autoScrollToMatcher={false}
        />
      </div>

      {/* Filter & Search Bar */}
      <div style={{ background: 'white', padding: '1rem', borderRadius: '14px', border: '1px solid #E2E8F0', marginBottom: '1.5rem', display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
        {/* Search */}
        <div style={{ flex: '1 1 220px', position: 'relative' }}>
          <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            className="form-input"
            placeholder={activeTab === 'accommodations' ? "Search stays, amenities, address..." : "Search mess name, specialties..."}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '2.25rem' }}
          />
        </div>

        {/* Category Filter */}
        <select
          className="form-select"
          style={{ width: 'auto', minWidth: '150px' }}
          value={selectedCategory}
          onChange={e => setSelectedCategory(e.target.value)}
        >
          <option value="all">All Categories</option>
          {COLLEGE_CATEGORIES.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.label}</option>
          ))}
        </select>

        {/* Locality Filter */}
        <select
          className="form-select"
          style={{ width: 'auto', minWidth: '160px' }}
          value={selectedLocality}
          onChange={e => setSelectedLocality(e.target.value)}
        >
          <option value="all">All Localities</option>
          {localities.map(loc => (
            <option key={loc} value={loc}>{loc}</option>
          ))}
        </select>

        {/* College Filter */}
        <select
          className="form-select"
          style={{ width: 'auto', minWidth: '180px' }}
          value={selectedCollege}
          onChange={e => setSelectedCollege(e.target.value)}
        >
          <option value="all">All Colleges ({collegesData.length})</option>
          {collegesData.map(c => (
            <option key={c.id} value={c.id}>{c.shortName} ({c.locality})</option>
          ))}
        </select>

        {activeTab === 'accommodations' && (
          <>
            {/* Hostel For Filter */}
            <select
              className="form-select"
              style={{ width: 'auto', minWidth: '140px' }}
              value={selectedHostelFor}
              onChange={e => setSelectedHostelFor(e.target.value)}
            >
              <option value="all">Hostel For: All</option>
              <option value="boys">Boys Hostel</option>
              <option value="girls">Girls Hostel</option>
            </select>

            {/* Stay Type Filter */}
            <select
              className="form-select"
              style={{ width: 'auto', minWidth: '150px' }}
              value={selectedType}
              onChange={e => setSelectedType(e.target.value)}
            >
              <option value="all">All Room Types</option>
              <option value="Shared Room (2-Sharing)">2-Sharing</option>
              <option value="Shared Room (3-Sharing)">3-Sharing</option>
              <option value="Single Room">Single Room</option>
              <option value="Student Hostel / PG">Hostel / PG</option>
              <option value="1RK / 1BHK Flat">Flat</option>
            </select>
          </>
        )}

        {activeTab === 'messes' && (
          <select
            className="form-select"
            style={{ width: 'auto', minWidth: '180px' }}
            value={selectedFoodType}
            onChange={e => setSelectedFoodType(e.target.value)}
          >
            <option value="all">All Food Types</option>
            <option value="Pure Veg">Pure Veg</option>
            <option value="Veg & Non-Veg">Veg & Non-Veg</option>
            <option value="Kolhapuri Special (Veg & Non-Veg)">Kolhapuri Special</option>
          </select>
        )}
      </div>

      {/* Accommodations Catalog Grid */}
      {activeTab === 'accommodations' && (
        <div className="cards-grid">
          {filteredAccommodations.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', padding: '3rem 1rem', textAlign: 'center', background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', color: '#64748B' }}>
              <Building2 size={36} color="#94A3B8" style={{ margin: '0 auto 0.75rem' }} />
              <h3>No student stays match your selected filters</h3>
              <p style={{ fontSize: '0.88rem', marginTop: '0.25rem' }}>Try clearing or relaxing some filters.</p>
            </div>
          ) : (
            filteredAccommodations.map(item => (
              <div key={item.id} className="listing-card">
                <div className="card-top-bar">
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <span className="card-type-badge">{item.type}</span>
                    <span className={`badge-hostel-for badge-hostel-${item.hostelFor || (item.genderAllowed === 'Girls' ? 'girls' : item.genderAllowed === 'Boys' ? 'boys' : 'any')}`}>
                      {item.hostelFor === 'girls' || item.genderAllowed === 'Girls' ? '👩 Girls Hostel' : item.hostelFor === 'boys' || item.genderAllowed === 'Boys' ? '👨 Boys Hostel' : '🤝 Co-ed / Any'}
                    </span>
                    {item.lastUpdated && (
                      <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
                        • {item.lastUpdated}
                      </span>
                    )}
                  </div>
                  <span className="card-type-badge" style={{ background: '#f8fafc', color: '#64748b' }}>
                    {item.foodIncluded ? 'Food Included' : 'Separate Mess'}
                  </span>
                </div>

                <div className="card-body">
                  <h3 className="card-title">{item.name}</h3>
                  <div className="card-locality">
                    <MapPin size={14} color="#64748b" />
                    <span>{item.address}</span>
                  </div>

                  <div className="cost-box">
                    <div className="cost-primary-row">
                      <span className="cost-label">Monthly Rent</span>
                      <span className="cost-value-total">{formatINR(item.monthlyRent)}/mo</span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', justifyContent: 'space-between' }}>
                      <span>Utilities Estimate:</span>
                      <strong>{formatINR(item.monthlyUtilities)}/mo</strong>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#b45309', marginTop: '0.25rem' }}>
                      Deposit: <strong>{formatINR(item.oneTimeDeposit)}</strong> (one-time)
                    </div>
                  </div>

                  {/* Highlight */}
                  <p style={{ fontSize: '0.82rem', color: '#475569', margin: '0.65rem 0', fontStyle: 'italic' }}>
                    "{item.highlight}"
                  </p>

                  {/* Colleges Served summary */}
                  <div style={{ margin: '0.5rem 0', fontSize: '0.75rem', color: '#64748b' }}>
                    <strong>Nearby: </strong>
                    {item.collegesServed.slice(0, 3).map(cs => {
                      const c = collegesData.find(col => col.id === cs.collegeId);
                      return `${c?.shortName || cs.collegeId} (${cs.distanceKm} km)`;
                    }).join(' • ')}
                  </div>

                  {/* Amenities Tags */}
                  <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', margin: '0.75rem 0' }}>
                    {item.amenities.slice(0, 4).map((a, i) => (
                      <span key={i} style={{ background: '#f1f5f9', fontSize: '0.7rem', padding: '0.15rem 0.45rem', borderRadius: '4px', color: '#475569' }}>
                        {a}
                      </span>
                    ))}
                    {item.amenities.length > 4 && (
                      <span style={{ fontSize: '0.7rem', color: '#64748b', alignSelf: 'center' }}>
                        +{item.amenities.length - 4} more
                      </span>
                    )}
                  </div>

                  <div style={{ marginTop: 'auto', paddingTop: '0.5rem' }}>
                    <button
                      className="pill-btn-dark-sm"
                      style={{ width: '100%', justifyContent: 'center' }}
                      onClick={() => onOpenAccommodationDetails(item)}
                    >
                      <span>View Full Details & Rules</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Messes Catalog Grid */}
      {activeTab === 'messes' && (
        <div className="cards-grid">
          {filteredMesses.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', padding: '3rem 1rem', textAlign: 'center', background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', color: '#64748B' }}>
              <Utensils size={36} color="#94A3B8" style={{ margin: '0 auto 0.75rem' }} />
              <h3>No messes match your selected filters</h3>
              <p style={{ fontSize: '0.88rem', marginTop: '0.25rem' }}>Try choosing another food type or locality.</p>
            </div>
          ) : (
            filteredMesses.map(item => (
              <div key={item.id} className="listing-card">
                <div className="card-top-bar">
                  <span style={{ 
                    fontSize: '0.72rem', 
                    fontWeight: 700, 
                    padding: '0.2rem 0.5rem', 
                    borderRadius: '9999px',
                    background: item.foodType === 'Pure Veg' ? '#ecfdf5' : '#fff7ed',
                    color: item.foodType === 'Pure Veg' ? '#047857' : '#c2410c'
                  }}>
                    {item.foodType}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>
                    {item.tiffinAvailable ? '🍱 Tiffin Available' : 'Dine-In Only'}
                  </span>
                </div>

                <div className="card-body">
                  <h3 className="card-title">{item.name}</h3>
                  <div className="card-locality">
                    <MapPin size={14} color="#64748b" />
                    <span>{item.address}</span>
                  </div>

                  <div className="cost-box">
                    <div className="cost-primary-row">
                      <span className="cost-label">Monthly Meal Plan</span>
                      <span className="cost-value-total">{formatINR(item.monthlyMealPrice)}/mo</span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.25rem' }}>
                      {item.mealPlan}
                    </div>
                  </div>

                  {/* Sunday Special */}
                  <div style={{ background: '#f8fafc', padding: '0.6rem', borderRadius: '8px', border: '1px solid #e2e8f0', margin: '0.75rem 0', fontSize: '0.8rem' }}>
                    <div style={{ color: '#2563eb', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.2rem' }}>
                      <Coffee size={13} />
                      Sunday Special:
                    </div>
                    <div style={{ color: '#334155' }}>{item.sundaySpecial}</div>
                  </div>

                  {/* Specialties */}
                  <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                    {item.specialties.slice(0, 3).map((s, i) => (
                      <span key={i} style={{ background: '#f1f5f9', fontSize: '0.7rem', padding: '0.15rem 0.45rem', borderRadius: '4px', color: '#475569' }}>
                        ✓ {s}
                      </span>
                    ))}
                  </div>

                  {/* Demo Contact */}
                  <div style={{ marginTop: 'auto', background: '#f8fafc', padding: '0.6rem', borderRadius: '8px', fontSize: '0.78rem', color: '#64748b' }}>
                    <div><strong>Contact:</strong> {item.demoContact.managerName}</div>
                    <div><strong>Timing:</strong> {item.demoContact.timing}</div>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.2rem' }}>{item.demoStatus}</div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
