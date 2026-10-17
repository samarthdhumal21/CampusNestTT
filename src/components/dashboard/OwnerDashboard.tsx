import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Home,
  UtensilsCrossed,
  Clock, 
  PlusCircle, 
  CheckCircle, 
  AlertCircle, 
  ShieldAlert, 
  Save, 
  X, 
  Tag, 
  MapPin, 
  IndianRupee,
  ShieldX,
  Mail
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getStoredOwnerListings, submitOwnerListing } from '../../services/auth';
import { collegesData } from '../../data/colleges';
import { formatINR } from '../../utils/formatters';
import type { 
  AccommodationType, 
  HostelFor, 
  FoodType,
  OwnerListingSubmission, 
  OwnerType 
} from '../../types';

export const OwnerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [listings, setListings] = useState<OwnerListingSubmission[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [submittedNotice, setSubmittedNotice] = useState<string | null>(null);

  // Common form fields
  const [name, setName] = useState('');
  const [locality, setLocality] = useState('Kasaba Bawada');
  const [selectedCollegeId, setSelectedCollegeId] = useState('dypcet');
  const [distanceKm, setDistanceKm] = useState(0.8);

  // Accommodation (PG & Hostel) specific fields
  const [accType, setAccType] = useState<AccommodationType>('Shared Room (2-Sharing)');
  const [monthlyRent, setMonthlyRent] = useState(3500);
  const [monthlyUtilities, setMonthlyUtilities] = useState(400);
  const [oneTimeDeposit, setOneTimeDeposit] = useState(5000);
  const [hostelFor, setHostelFor] = useState<HostelFor>('boys');
  const [amenitiesInput, setAmenitiesInput] = useState('Wi-Fi 100 Mbps, Hot Water Geyser, RO Water, CCTV Security');

  // Mess specific fields
  const [monthlyMealPrice, setMonthlyMealPrice] = useState(2400);
  const [foodType, setFoodType] = useState<FoodType>('Veg & Non-Veg');

  const ownerType: OwnerType = user?.ownerType || 'pg';
  const ownerStatus = user?.ownerStatus || 'pending';
  const isApproved = ownerStatus === 'approved';
  const isRejected = ownerStatus === 'rejected';
  const isPending = !isApproved && !isRejected;

  useEffect(() => {
    const all = getStoredOwnerListings();
    if (user?.uid) {
      setListings(all.filter(l => l.ownerId === user.uid));
    } else {
      setListings(all);
    }
  }, [user?.uid]);

  const handleSubmitNewListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !isApproved) return;

    let newSubmission: Parameters<typeof submitOwnerListing>[0];

    if (ownerType === 'mess') {
      newSubmission = {
        ownerId: user.uid,
        ownerType: 'mess',
        name,
        locality,
        monthlyMealPrice: Number(monthlyMealPrice),
        foodType,
        collegesServed: [{ collegeId: selectedCollegeId, distanceKm: Number(distanceKm) }]
      };
    } else {
      const amenities = amenitiesInput.split(',').map(s => s.trim()).filter(Boolean);
      newSubmission = {
        ownerId: user.uid,
        ownerType,
        name,
        type: ownerType === 'hostel' ? 'Student Hostel / PG' : accType,
        locality,
        monthlyRent: Number(monthlyRent),
        monthlyUtilities: Number(monthlyUtilities),
        oneTimeDeposit: Number(oneTimeDeposit),
        collegesServed: [{ collegeId: selectedCollegeId, distanceKm: Number(distanceKm) }],
        amenities,
        hostelFor
      };
    }

    const created = await submitOwnerListing(newSubmission);
    setListings(prev => [created, ...prev]);
    setShowAddModal(false);
    setSubmittedNotice(`Listing "${name}" submitted successfully! It is labelled "owner-submitted, not verified" with status "pending review" until an admin approves it.`);
    setName('');
  };

  return (
    <div className="dashboard-container max-w-6xl mx-auto px-4 py-8 sm:py-12">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-navy-800 text-white rounded-[28px] p-6 sm:p-10 shadow-xl mb-8 relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-sky-200 text-xs font-semibold uppercase tracking-wider mb-3">
            {ownerType === 'pg' && <Home className="w-3.5 h-3.5" />}
            {ownerType === 'hostel' && <Building2 className="w-3.5 h-3.5" />}
            {ownerType === 'mess' && <UtensilsCrossed className="w-3.5 h-3.5" />}
            <span>
              {ownerType === 'pg' ? 'PG Owner Portal' : ownerType === 'hostel' ? 'Hostel Owner Portal' : 'Mess Owner Portal'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif mb-2">
            Owner Dashboard: {user?.displayName || 'Accommodation Partner'}
          </h1>
          <p className="text-sky-100/90 text-sm sm:text-base max-w-2xl">
            {ownerType === 'mess'
              ? 'Manage student dining, tiffin plans, and nearby colleges. Transparent rates protect Kolhapur students.'
              : 'Manage your Kolhapur student housing listings. Transparent itemized rents protect students from hidden costs.'}
          </p>
        </div>
      </div>

      {submittedNotice && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-sm flex items-start justify-between gap-3 animate-fade-in">
          <div className="flex items-start gap-2.5">
            <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <span>{submittedNotice}</span>
          </div>
          <button 
            type="button" 
            onClick={() => setSubmittedNotice(null)}
            className="text-emerald-600 hover:text-emerald-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* STATE 1: PENDING APPROVAL */}
      {isPending && (
        <div className="bg-amber-50/90 border border-amber-200 rounded-[24px] p-6 sm:p-8 text-center max-w-2xl mx-auto mb-8 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 mx-auto flex items-center justify-center mb-4">
            <Clock className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-navy-950 font-serif mb-2">
            Waiting for Admin Approval
          </h2>
          <p className="text-slate-600 text-sm leading-relaxed mb-6">
            Your owner account has been registered with status <strong className="text-amber-800">"pending"</strong>. To maintain high living standards and student safety in Kolhapur, property owners must be verified by a platform administrator before publishing live listings. Nothing can be published until your account is approved.
          </p>
          <div className="p-4 bg-white/80 rounded-xl border border-amber-200/60 inline-flex items-center gap-3 text-xs text-slate-500 text-left">
            <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <span>Once approved, you will be able to add {ownerType === 'pg' ? 'PG listings' : ownerType === 'hostel' ? 'Hostel listings' : 'Mess listings'}.</span>
          </div>
        </div>
      )}

      {/* STATE 2: REJECTED */}
      {isRejected && (
        <div className="bg-rose-50/90 border border-rose-200 rounded-[24px] p-6 sm:p-8 text-center max-w-2xl mx-auto mb-8 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-800 mx-auto flex items-center justify-center mb-4">
            <ShieldX className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-navy-950 font-serif mb-2">
            Application Status: Not Approved
          </h2>
          <p className="text-slate-600 text-sm leading-relaxed mb-6">
            Thank you for your interest in partnering with CampusNest Kolhapur. At this time, our administration team was unable to verify your property documentation or listing credentials.
          </p>
          <div className="p-4 bg-white/80 rounded-xl border border-rose-200/60 inline-flex items-center gap-3 text-xs text-slate-600 text-left">
            <Mail className="w-5 h-5 text-rose-600 flex-shrink-0" />
            <span>
              If you believe this is in error or wish to submit additional property verification proofs, please contact our support desk at <strong className="text-navy-950">admin@campusnest.kolhapur.edu</strong>.
            </span>
          </div>
        </div>
      )}

      {/* STATE 3: APPROVED OWNER */}
      {isApproved && (
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-navy-950 font-serif">
                {ownerType === 'mess' ? 'My Mess Listings' : 'My Listings'}
              </h2>
              <p className="text-xs text-slate-500">
                {ownerType === 'pg' && 'Manage your paying guest rooms. Every listing shows "owner-submitted, not verified" until admin approval.'}
                {ownerType === 'hostel' && 'Manage your private student hostels. Listings start with status "pending review".'}
                {ownerType === 'mess' && 'Manage your student dining & tiffin services.'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-navy-800 hover:bg-navy-900 active:bg-navy-950 text-white rounded-full text-xs font-semibold shadow-sm transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>
                {ownerType === 'pg' ? 'Add PG Listing' : ownerType === 'hostel' ? 'Add Hostel Listing' : 'Add Mess Listing'}
              </span>
            </button>
          </div>

          {listings.length === 0 ? (
            <div className="bg-white rounded-[24px] p-12 text-center border border-dashed border-slate-200">
              {ownerType === 'mess' ? (
                <UtensilsCrossed className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              ) : (
                <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              )}
              <h3 className="font-bold text-navy-950 text-base mb-1">No listings submitted yet</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mb-6">
                Click "{ownerType === 'pg' ? 'Add PG Listing' : ownerType === 'hostel' ? 'Add Hostel Listing' : 'Add Mess Listing'}" to publish student accommodations or dining plans near Kolhapur campuses.
              </p>
              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="px-5 py-2.5 bg-navy-800 text-white rounded-full text-xs font-medium"
              >
                Create Listing
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {listings.map(item => (
                <div 
                  key={item.id} 
                  className="bg-white rounded-[24px] p-6 border border-slate-200 shadow-sm hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {item.ownerType === 'mess' ? `Mess: ${item.foodType || 'Dining'}` : item.type || 'Accommodation'}
                    </span>
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                      item.status === 'approved' 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : item.status === 'rejected'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {item.status.toUpperCase()}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-navy-950 mb-1">{item.name}</h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mb-4">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{item.locality}</span>
                    {item.hostelFor && (
                      <>
                        <span className="text-slate-300">•</span>
                        <span className="capitalize">{item.hostelFor} Hostel</span>
                      </>
                    )}
                  </p>

                  {item.ownerType === 'mess' ? (
                    <div className="p-3 bg-slate-50 rounded-xl mb-4 text-center">
                      <span className="text-[10px] text-slate-400 block uppercase">Monthly Meal Plan</span>
                      <span className="text-sm font-bold text-navy-950">{formatINR(item.monthlyMealPrice || 0)}/mo</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-xl mb-4 text-center">
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase">Rent</span>
                        <span className="text-xs font-bold text-navy-950">{formatINR(item.monthlyRent || 0)}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase">Utilities</span>
                        <span className="text-xs font-bold text-navy-950">{formatINR(item.monthlyUtilities || 0)}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase">Deposit</span>
                        <span className="text-xs font-bold text-navy-950">{formatINR(item.oneTimeDeposit || 0)}</span>
                      </div>
                    </div>
                  )}

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="inline-flex items-center gap-1.5 text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md text-[11px] font-medium border border-amber-200/60">
                      <Tag className="w-3 h-3" />
                      <span>{item.verificationBadge || 'owner-submitted, not verified'}</span>
                    </span>
                    <span className="text-[11px] text-slate-400">
                      No public vacancy claimed
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add Listing Modal Form */}
      {showAddModal && isApproved && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm animate-fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-[24px] max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-navy-950 font-serif">
                {ownerType === 'pg' ? 'Add PG Listing' : ownerType === 'hostel' ? 'Add Hostel Listing' : 'Add Mess Listing'}
              </h3>
              <button 
                type="button" 
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitNewListing} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-navy-950 mb-1">
                  {ownerType === 'mess' ? 'Mess / Dining Facility Name *' : 'Accommodation / Property Name *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={ownerType === 'mess' ? 'e.g. Mahalakshmi Student Mess' : 'e.g. Shahu PG for Students'}
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-navy-700"
                />
              </div>

              {/* PG / Hostel accommodation inputs */}
              {ownerType !== 'mess' && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-navy-950 mb-1">Accommodation Type</label>
                      <select
                        value={ownerType === 'hostel' ? 'Student Hostel / PG' : accType}
                        onChange={e => setAccType(e.target.value as AccommodationType)}
                        disabled={ownerType === 'hostel'}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-navy-700 disabled:bg-slate-100"
                      >
                        {ownerType === 'hostel' ? (
                          <option value="Student Hostel / PG">Student Hostel / PG</option>
                        ) : (
                          <>
                            <option value="Single Room">Single Room</option>
                            <option value="Shared Room (2-Sharing)">Shared Room (2-Sharing)</option>
                            <option value="Shared Room (3-Sharing)">Shared Room (3-Sharing)</option>
                            <option value="1RK / 1BHK Flat">1RK / 1BHK Flat</option>
                          </>
                        )}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-navy-950 mb-1">Locality in Kolhapur *</label>
                      <input
                        type="text"
                        required
                        value={locality}
                        onChange={e => setLocality(e.target.value)}
                        placeholder="e.g. Rajarampuri, Kasaba Bawada"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-navy-700"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-navy-950 mb-1">Rent (₹/mo) *</label>
                      <input
                        type="number"
                        required
                        min={1000}
                        step={100}
                        value={monthlyRent}
                        onChange={e => setMonthlyRent(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-navy-700"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-navy-950 mb-1">Utilities (₹/mo) *</label>
                      <input
                        type="number"
                        required
                        min={0}
                        step={50}
                        value={monthlyUtilities}
                        onChange={e => setMonthlyUtilities(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-navy-700"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-navy-950 mb-1">Deposit (₹) *</label>
                      <input
                        type="number"
                        required
                        min={0}
                        step={500}
                        value={oneTimeDeposit}
                        onChange={e => setOneTimeDeposit(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-navy-700"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-navy-950 mb-1">Hostel For</label>
                      <select
                        value={hostelFor}
                        onChange={e => setHostelFor(e.target.value as HostelFor)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-navy-700"
                      >
                        <option value="boys">Boys</option>
                        <option value="girls">Girls</option>
                        <option value="any">Co-ed / Any</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-navy-950 mb-1">Primary College Served</label>
                      <select
                        value={selectedCollegeId}
                        onChange={e => setSelectedCollegeId(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-navy-700"
                      >
                        {collegesData.map(col => (
                          <option key={col.id} value={col.id}>
                            {col.shortName} ({col.locality})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-navy-950 mb-1">
                      Distance to chosen college (km) *
                    </label>
                    <input
                      type="number"
                      step={0.1}
                      min={0.1}
                      max={30}
                      required
                      value={distanceKm}
                      onChange={e => setDistanceKm(Number(e.target.value))}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-navy-700"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-navy-950 mb-1">
                      Amenities (comma separated)
                    </label>
                    <input
                      type="text"
                      value={amenitiesInput}
                      onChange={e => setAmenitiesInput(e.target.value)}
                      placeholder="e.g. Wi-Fi, Hot Water, CCTV, Study Table"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-navy-700"
                    />
                  </div>
                </>
              )}

              {/* Mess specific inputs */}
              {ownerType === 'mess' && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-navy-950 mb-1">Locality in Kolhapur *</label>
                      <input
                        type="text"
                        required
                        value={locality}
                        onChange={e => setLocality(e.target.value)}
                        placeholder="e.g. Kasaba Bawada, Shivaji Park"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-navy-700"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-navy-950 mb-1">Monthly Meal Price (₹/mo) *</label>
                      <input
                        type="number"
                        required
                        min={1000}
                        step={50}
                        value={monthlyMealPrice}
                        onChange={e => setMonthlyMealPrice(Number(e.target.value))}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-navy-700"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-navy-950 mb-1">Food Type</label>
                      <select
                        value={foodType}
                        onChange={e => setFoodType(e.target.value as FoodType)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-navy-700"
                      >
                        <option value="Pure Veg">Pure Veg</option>
                        <option value="Veg & Non-Veg">Veg & Non-Veg</option>
                        <option value="Kolhapuri Special (Veg & Non-Veg)">Kolhapuri Special (Veg & Non-Veg)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-navy-950 mb-1">Primary College Served</label>
                      <select
                        value={selectedCollegeId}
                        onChange={e => setSelectedCollegeId(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-navy-700"
                      >
                        {collegesData.map(col => (
                          <option key={col.id} value={col.id}>
                            {col.shortName} ({col.locality})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-navy-950 mb-1">
                      Distance to primary college (km) *
                    </label>
                    <input
                      type="number"
                      step={0.1}
                      min={0.1}
                      max={30}
                      required
                      value={distanceKm}
                      onChange={e => setDistanceKm(Number(e.target.value))}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-navy-700"
                    />
                  </div>
                </>
              )}

              {/* Public Notice Disclaimer */}
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/60 text-xs text-amber-800 flex items-start gap-2">
                <Tag className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>
                  Owner listings start with status <strong>"pending review"</strong> and are labelled <strong>"owner-submitted, not verified"</strong>. Personal owner contact details are never exposed to students.
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-full text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-navy-800 hover:bg-navy-900 active:bg-navy-950 text-white rounded-full text-xs font-semibold shadow-sm transition inline-flex items-center gap-1.5"
                >
                  <Save size={14} />
                  <span>Submit Listing</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
