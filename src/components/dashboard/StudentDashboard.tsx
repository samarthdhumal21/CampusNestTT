import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  Search, 
  Layers, 
  Trash2, 
  ArrowRight, 
  ExternalLink, 
  Home, 
  Building2, 
  ShieldCheck,
  MapPin,
  GraduationCap
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getStudentShortlist, toggleStudentShortlist } from '../../services/auth';
import { accommodationsData } from '../../data/accommodations';
import { formatINR } from '../../utils/formatters';
import type { AccommodationListing } from '../../types';

interface StudentDashboardProps {
  onFindStayClick: (collegeId?: string) => void;
  onOpenDetails: (acc: AccommodationListing) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  onFindStayClick,
  onOpenDetails
}) => {
  const { user } = useAuth();
  const [shortlistIds, setShortlistIds] = useState<string[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    // Load student shortlist
    getStudentShortlist(user?.uid).then(setShortlistIds);

    // Load recent college searches
    try {
      const raw = localStorage.getItem('campusnest_recent_colleges');
      if (raw) setRecentSearches(JSON.parse(raw));
    } catch {
      // ignore
    }
  }, [user?.uid]);

  const handleRemoveShortlist = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = await toggleStudentShortlist(id, user?.uid);
    setShortlistIds(updated);
  };

  const handleClearSearches = () => {
    localStorage.removeItem('campusnest_recent_colleges');
    setRecentSearches([]);
  };

  const shortlistedStays = accommodationsData.filter(acc => shortlistIds.includes(acc.id));

  return (
    <div className="dashboard-container max-w-6xl mx-auto px-4 py-8 sm:py-12">
      {/* Top Welcome Card */}
      <div className="bg-gradient-to-r from-navy-900 via-navy-800 to-navy-950 text-white rounded-[28px] p-6 sm:p-10 shadow-xl mb-8 relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-sky-200 text-xs font-semibold uppercase tracking-wider mb-3">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Student Dashboard</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif mb-2">
            Welcome back, {user?.displayName || 'Kolhapur Scholar'}!
          </h1>
          <p className="text-sky-100/90 text-sm sm:text-base max-w-2xl">
            Track your saved Kolhapur stays, recent campus budget searches, and side-by-side room comparisons.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Shortlisted Accommodations (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                  <Heart className="w-5 h-5 fill-rose-500" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-navy-950 font-serif">Saved Shortlist</h2>
                  <p className="text-xs text-slate-500">
                    {shortlistedStays.length} stay{shortlistedStays.length === 1 ? '' : 's'} saved {user ? 'to your account' : '(guest mode)'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onFindStayClick()}
                className="text-xs font-semibold text-navy-700 hover:text-navy-900 flex items-center gap-1"
              >
                <span>Browse more stays</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {shortlistedStays.length === 0 ? (
              <div className="text-center py-12 px-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <Heart className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-semibold text-navy-950 mb-1">Your shortlist is currently empty</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mb-5">
                  Browse verified student rooms near your campus and click the heart icon on any card to save it here.
                </p>
                <button
                  type="button"
                  onClick={() => onFindStayClick()}
                  className="px-5 py-2.5 bg-navy-800 hover:bg-navy-900 text-white rounded-full text-xs font-medium shadow-sm transition"
                >
                  Explore Kolhapur Stays
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {shortlistedStays.map(stay => (
                  <div
                    key={stay.id}
                    onClick={() => onOpenDetails(stay)}
                    className="p-4 rounded-2xl border border-slate-200 hover:border-navy-400 hover:shadow-md transition cursor-pointer bg-white group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          {stay.type}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => handleRemoveShortlist(stay.id, e)}
                          title="Remove from shortlist"
                          className="text-slate-400 hover:text-rose-600 p-1 rounded-md transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <h4 className="font-bold text-navy-950 text-sm group-hover:text-navy-700 transition line-clamp-1">
                        {stay.name}
                      </h4>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{stay.locality}</span>
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-xs text-slate-400 block">Monthly Rent</span>
                        <span className="text-sm font-bold text-navy-900">{formatINR(stay.monthlyRent)}/mo</span>
                      </div>
                      <span className="text-xs text-navy-700 font-semibold group-hover:underline flex items-center gap-1">
                        Details <ExternalLink className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Recent Searches & Shortcuts */}
        <div className="space-y-6">
          {/* Recent Searches */}
          <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-navy-700" />
                <h3 className="font-bold text-navy-950 text-sm">Recent Searches</h3>
              </div>
              {recentSearches.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearSearches}
                  className="text-[11px] text-slate-400 hover:text-slate-600"
                >
                  Clear
                </button>
              )}
            </div>

            {recentSearches.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No recent campus searches yet.</p>
            ) : (
              <div className="space-y-2">
                {recentSearches.map((term, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => onFindStayClick(term)}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-slate-50 transition flex items-center justify-between text-xs text-slate-700 border border-slate-100"
                  >
                    <span className="truncate">{term}</span>
                    <ArrowRight className="w-3 h-3 text-slate-400 flex-shrink-0" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Shortcuts */}
          <div className="bg-sky-50/70 border border-sky-100 rounded-[24px] p-6">
            <h3 className="font-bold text-navy-950 text-sm mb-2 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-navy-700" />
              <span>CampusNest Advice</span>
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Kolhapur rentals typically include water, while electricity is metered at ₹8–₹10/unit. Always budget separately for meals and commute passes.
            </p>
            <button
              type="button"
              onClick={() => onFindStayClick()}
              className="w-full py-2.5 px-4 bg-navy-800 hover:bg-navy-900 text-white rounded-full text-xs font-semibold transition"
            >
              Recalculate Living Cost
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

function GraduationCapIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
      <path d="M6 12v5c3 3 9 3 12 0v-5" />
    </svg>
  );
}
