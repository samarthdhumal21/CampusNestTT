import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Users, 
  Building2, 
  GraduationCap, 
  Check, 
  X, 
  EyeOff, 
  AlertTriangle, 
  CheckCircle,
  Tag,
  Home,
  UtensilsCrossed,
  MapPin
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { 
  getStoredOwnerListings, 
  adminApproveOwner, 
  adminUpdateListingStatus 
} from '../../services/auth';
import { collegesData } from '../../data/colleges';
import { formatINR } from '../../utils/formatters';
import type { 
  OwnerListingSubmission, 
  OwnerListingStatus, 
  OwnerType,
  College 
} from '../../types';

interface ConfirmationDialogState {
  isOpen: boolean;
  title: string;
  message: string;
  actionType: 'approve_owner' | 'reject_owner' | 'approve_listing' | 'reject_listing' | 'hide_listing';
  targetId: string;
}

interface PendingOwnerItem {
  uid: string;
  displayName: string;
  email: string;
  appliedAt: string;
  ownerType: OwnerType;
  status: 'pending' | 'approved' | 'rejected';
}

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'owners' | 'listings' | 'colleges'>('owners');
  const [ownerListings, setOwnerListings] = useState<OwnerListingSubmission[]>([]);
  const [colleges] = useState<College[]>(collegesData);

  // Mock pending owners for admin review with type badges (PG, Hostel, Mess)
  const [pendingOwners, setPendingOwners] = useState<PendingOwnerItem[]>([
    {
      uid: 'owner-patil-101',
      displayName: 'S. K. Patil (Bawada PG Rooms)',
      email: 's.patil@kolhapurproperties.org',
      appliedAt: '2026-10-15',
      ownerType: 'pg',
      status: 'pending'
    },
    {
      uid: 'owner-kadam-102',
      displayName: 'Kadam Private Student Hostel',
      email: 'contact@kadambhavan.com',
      appliedAt: '2026-10-16',
      ownerType: 'hostel',
      status: 'pending'
    },
    {
      uid: 'owner-bhosale-103',
      displayName: 'Annapurna Student Dining & Mess',
      email: 'bhosale.dining@kolhapur.edu',
      appliedAt: '2026-10-17',
      ownerType: 'mess',
      status: 'pending'
    }
  ]);

  const [confirmDialog, setConfirmDialog] = useState<ConfirmationDialogState>({
    isOpen: false,
    title: '',
    message: '',
    actionType: 'approve_owner',
    targetId: ''
  });

  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    setOwnerListings(getStoredOwnerListings());
  }, []);

  const openConfirmation = (
    title: string,
    message: string,
    actionType: ConfirmationDialogState['actionType'],
    targetId: string
  ) => {
    setConfirmDialog({
      isOpen: true,
      title,
      message,
      actionType,
      targetId
    });
  };

  const handleExecuteConfirmedAction = async () => {
    const { actionType, targetId } = confirmDialog;
    setConfirmDialog(prev => ({ ...prev, isOpen: false }));

    if (actionType === 'approve_owner') {
      await adminApproveOwner(targetId, true);
      setPendingOwners(prev => prev.map(o => o.uid === targetId ? { ...o, status: 'approved' } : o));
      setNotification(`Owner has been approved and granted publishing access.`);
    } else if (actionType === 'reject_owner') {
      await adminApproveOwner(targetId, false);
      setPendingOwners(prev => prev.map(o => o.uid === targetId ? { ...o, status: 'rejected' } : o));
      setNotification(`Owner request has been marked rejected.`);
    } else if (actionType === 'approve_listing') {
      await adminUpdateListingStatus(targetId, 'approved');
      setOwnerListings(prev => prev.map(l => l.id === targetId ? { ...l, status: 'approved' } : l));
      setNotification(`Listing approved and marked visible to students.`);
    } else if (actionType === 'reject_listing') {
      await adminUpdateListingStatus(targetId, 'rejected');
      setOwnerListings(prev => prev.map(l => l.id === targetId ? { ...l, status: 'rejected' } : l));
      setNotification(`Listing rejected.`);
    } else if (actionType === 'hide_listing') {
      await adminUpdateListingStatus(targetId, 'hidden');
      setOwnerListings(prev => prev.map(l => l.id === targetId ? { ...l, status: 'hidden' } : l));
      setNotification(`Listing hidden from search results.`);
    }
  };

  return (
    <div className="dashboard-container max-w-6xl mx-auto px-4 py-8 sm:py-12">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-navy-800 text-white rounded-[28px] p-6 sm:p-10 shadow-xl mb-8 relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Platform Administration Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif mb-2">
            CampusNest Admin Console
          </h1>
          <p className="text-sky-100/90 text-sm sm:text-base max-w-2xl">
            Vetting and governance portal for Kolhapur student housing, property owner approvals, and submitted listing reviews. Admin accounts are set exclusively via the console.
          </p>
        </div>
      </div>

      {notification && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-sm flex items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>{notification}</span>
          </div>
          <button 
            type="button" 
            onClick={() => setNotification(null)}
            className="text-emerald-700 hover:text-emerald-900 font-bold"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 mb-6 border-b border-slate-200 pb-3 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('owners')}
          className={`px-4 py-2 rounded-full text-xs font-semibold transition flex items-center gap-2 shrink-0 ${
            activeTab === 'owners'
              ? 'bg-navy-800 text-white'
              : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Pending Owners ({pendingOwners.filter(o => o.status === 'pending').length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('listings')}
          className={`px-4 py-2 rounded-full text-xs font-semibold transition flex items-center gap-2 shrink-0 ${
            activeTab === 'listings'
              ? 'bg-navy-800 text-white'
              : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Submitted Listings ({ownerListings.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('colleges')}
          className={`px-4 py-2 rounded-full text-xs font-semibold transition flex items-center gap-2 shrink-0 ${
            activeTab === 'colleges'
              ? 'bg-navy-800 text-white'
              : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          <GraduationCap className="w-3.5 h-3.5" />
          <span>Colleges Database ({colleges.length})</span>
        </button>
      </div>

      {/* TAB 1: PENDING OWNERS WITH TYPE BADGES */}
      {activeTab === 'owners' && (
        <div className="bg-white rounded-[24px] p-6 border border-slate-200 shadow-sm">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-navy-950 font-serif">Property Owner Verification Queue</h2>
            <p className="text-xs text-slate-500">
              Review owner applicants categorized by PG, Hostel, or Mess. Approval grants permission to publish listings.
            </p>
          </div>

          <div className="divide-y divide-slate-100">
            {pendingOwners.map(owner => (
              <div key={owner.uid} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-navy-950">{owner.displayName}</span>

                    {/* Owner Type Badge */}
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider inline-flex items-center gap-1 ${
                      owner.ownerType === 'pg' 
                        ? 'bg-sky-100 text-sky-800 border border-sky-200' 
                        : owner.ownerType === 'hostel'
                        ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                        : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}>
                      {owner.ownerType === 'pg' && <Home size={10} />}
                      {owner.ownerType === 'hostel' && <Building2 size={10} />}
                      {owner.ownerType === 'mess' && <UtensilsCrossed size={10} />}
                      <span>{owner.ownerType.toUpperCase()} Owner</span>
                    </span>

                    {/* Approval Status Badge */}
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      owner.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                      owner.status === 'rejected' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {owner.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Applied on: {owner.appliedAt} • Email: <code className="text-slate-600 font-mono text-[11px]">{owner.email}</code>
                  </p>
                </div>

                {owner.status === 'pending' ? (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openConfirmation(
                        'Approve Property Owner',
                        `Are you sure you want to approve "${owner.displayName}" as a verified ${owner.ownerType.toUpperCase()} Owner? They will be granted permissions to publish live listings.`,
                        'approve_owner',
                        owner.uid
                      )}
                      className="px-3.5 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Approve</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => openConfirmation(
                        'Reject Property Owner',
                        `Are you sure you want to reject the application for "${owner.displayName}"?`,
                        'reject_owner',
                        owner.uid
                      )}
                      className="px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 text-xs font-semibold flex items-center gap-1.5 transition border border-slate-200"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                  </div>
                ) : (
                  <span className="text-xs text-slate-400 italic">Action completed</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: REVIEW SUBMITTED LISTINGS */}
      {activeTab === 'listings' && (
        <div className="bg-white rounded-[24px] p-6 border border-slate-200 shadow-sm">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-navy-950 font-serif">Submitted Listings for Review</h2>
            <p className="text-xs text-slate-500">
              Listings submitted by approved owners. All listings start with status "pending review" and are labelled "owner-submitted, not verified" until an admin approves them.
            </p>
          </div>

          {ownerListings.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              No submitted listings in queue.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {ownerListings.map(listing => (
                <div key={listing.id} className="py-4 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-navy-950">{listing.name}</span>
                      <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {listing.ownerType === 'mess' ? `Mess: ${listing.foodType}` : listing.type}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        listing.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                        listing.status === 'rejected' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {listing.status.toUpperCase()}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <MapPin size={12} className="text-slate-400" />
                      <span>{listing.locality}</span>
                      <span className="text-slate-300">•</span>
                      <span>
                        {listing.ownerType === 'mess' 
                          ? `Meal: ${formatINR(listing.monthlyMealPrice || 0)}/mo` 
                          : `Rent: ${formatINR(listing.monthlyRent || 0)}/mo`}
                      </span>
                    </p>

                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        {listing.verificationBadge || 'owner-submitted, not verified'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {listing.status !== 'approved' && (
                      <button
                        type="button"
                        onClick={() => openConfirmation(
                          'Approve Listing',
                          `Approve listing "${listing.name}"? It will be marked verified and made visible to all students.`,
                          'approve_listing',
                          listing.id
                        )}
                        className="px-3 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1 transition shadow-sm"
                      >
                        <Check size={12} />
                        <span>Approve</span>
                      </button>
                    )}

                    {listing.status !== 'rejected' && (
                      <button
                        type="button"
                        onClick={() => openConfirmation(
                          'Reject Listing',
                          `Reject listing "${listing.name}"?`,
                          'reject_listing',
                          listing.id
                        )}
                        className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 text-xs font-semibold flex items-center gap-1 transition border border-slate-200"
                      >
                        <X size={12} />
                        <span>Reject</span>
                      </button>
                    )}

                    {listing.status !== 'hidden' && (
                      <button
                        type="button"
                        onClick={() => openConfirmation(
                          'Hide Listing',
                          `Hide listing "${listing.name}" from public searches?`,
                          'hide_listing',
                          listing.id
                        )}
                        className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold flex items-center gap-1 transition"
                      >
                        <EyeOff size={12} />
                        <span>Hide</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: COLLEGES */}
      {activeTab === 'colleges' && (
        <div className="bg-white rounded-[24px] p-6 border border-slate-200 shadow-sm">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-navy-950 font-serif">Colleges & Institutes ({colleges.length})</h2>
            <p className="text-xs text-slate-500">
              Master directory of Kolhapur higher education institutes.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {colleges.map(col => (
              <div key={col.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-xs text-navy-950 block">{col.shortName}</span>
                <span className="text-[11px] text-slate-500 block truncate">{col.fullName}</span>
                <span className="text-[10px] text-slate-400 block mt-1">{col.locality}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Confirmation Dialog Modal */}
      {confirmDialog.isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm animate-fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-[24px] max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-scale-up">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                <AlertTriangle size={20} />
              </div>
              <h3 className="text-base font-bold text-navy-950">{confirmDialog.title}</h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed mb-6">
              {confirmDialog.message}
            </p>

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 rounded-full text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteConfirmedAction}
                className="px-5 py-2 bg-navy-800 hover:bg-navy-900 active:bg-navy-950 text-white rounded-full text-xs font-semibold shadow-sm transition"
              >
                Confirm Action
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
