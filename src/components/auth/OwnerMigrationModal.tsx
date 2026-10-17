import React, { useState } from 'react';
import { Home, Building2, UtensilsCrossed, Check, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import type { OwnerType } from '../../types';

interface OwnerTypeChoice {
  id: OwnerType;
  title: string;
  desc: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

const OWNER_TYPES: OwnerTypeChoice[] = [
  {
    id: 'pg',
    title: 'PG Owner',
    desc: 'List & manage paying guest rooms and flats',
    icon: Home
  },
  {
    id: 'hostel',
    title: 'Hostel Owner',
    desc: 'List & manage private student hostels',
    icon: Building2
  },
  {
    id: 'mess',
    title: 'Mess Owner',
    desc: 'List & manage student dining & tiffin services',
    icon: UtensilsCrossed
  }
];

export const OwnerMigrationModal: React.FC = () => {
  const { showMigrationModal, completeMigration, user, loading } = useAuth();
  const [selectedType, setSelectedType] = useState<OwnerType>('pg');

  if (!showMigrationModal || !user || user.role !== 'owner') return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="migration-title"
    >
      <div className="bg-white rounded-[24px] max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-scale-up">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 mx-auto flex items-center justify-center mb-3">
            <Building2 className="w-6 h-6" />
          </div>
          <h2 id="migration-title" className="text-xl sm:text-2xl font-bold text-navy-950 font-serif">
            Complete Your Profile
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Hi {user.displayName}, please specify which type of property or dining service you manage to activate your dashboard.
          </p>
        </div>

        <div className="space-y-3 mb-6" role="radiogroup" aria-label="Select Owner Type">
          {OWNER_TYPES.map(item => {
            const isSelected = selectedType === item.id;
            const Icon = item.icon;
            return (
              <label
                key={item.id}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? 'border-navy-800 bg-sky-50/50 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div className={`p-2 rounded-xl ${isSelected ? 'bg-navy-800 text-white' : 'bg-slate-100 text-slate-600'}`}>
                    <Icon size={18} />
                  </div>
                  <input
                    type="radio"
                    name="ownerMigrationType"
                    value={item.id}
                    checked={isSelected}
                    onChange={() => setSelectedType(item.id)}
                    className="sr-only"
                  />
                  <div>
                    <h4 className="font-bold text-navy-950 text-sm">{item.title}</h4>
                    <p className="text-xs text-slate-500">{item.desc}</p>
                  </div>
                </div>
                {isSelected && (
                  <span className="w-5 h-5 rounded-full bg-navy-800 text-white flex items-center justify-center">
                    <Check size={12} strokeWidth={3} />
                  </span>
                )}
              </label>
            );
          })}
        </div>

        <div className="p-3 bg-slate-50 rounded-xl mb-6 flex items-start gap-2.5 text-xs text-slate-500 border border-slate-200/60">
          <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
          <span>
            This is a one-time setup. Once saved, only an administrator can change your property categorization.
          </span>
        </div>

        <button
          type="button"
          disabled={loading}
          onClick={() => completeMigration(selectedType)}
          className="w-full py-3 px-4 bg-navy-800 hover:bg-navy-900 active:bg-navy-950 text-white font-semibold rounded-full transition-all shadow-md hover:shadow-lg disabled:opacity-50 text-sm"
        >
          {loading ? 'Saving...' : 'Save & Continue to Dashboard'}
        </button>
      </div>
    </div>
  );
};
