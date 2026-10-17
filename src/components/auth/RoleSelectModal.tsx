import React, { useState } from 'react';
import { GraduationCap, Home, Building2, UtensilsCrossed, ShieldCheck, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import type { OwnerType } from '../../types';

interface RoleChoice {
  id: 'student' | 'pg' | 'hostel' | 'mess';
  role: 'student' | 'owner';
  ownerType: OwnerType | null;
  title: string;
  desc: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

const CHOICES: RoleChoice[] = [
  {
    id: 'student',
    role: 'student',
    ownerType: null,
    title: 'Student',
    desc: 'Find stays and messes, save your shortlist',
    icon: GraduationCap
  },
  {
    id: 'pg',
    role: 'owner',
    ownerType: 'pg',
    title: 'PG Owner',
    desc: 'List & manage paying guest rooms',
    icon: Home
  },
  {
    id: 'hostel',
    role: 'owner',
    ownerType: 'hostel',
    title: 'Hostel Owner',
    desc: 'List & manage private student hostels',
    icon: Building2
  },
  {
    id: 'mess',
    role: 'owner',
    ownerType: 'mess',
    title: 'Mess Owner',
    desc: 'List & manage student dining & tiffin',
    icon: UtensilsCrossed
  }
];

export const RoleSelectModal: React.FC = () => {
  const { showRoleModal, chooseRole, pendingFirebaseUser, loading } = useAuth();
  const [selectedId, setSelectedId] = useState<'student' | 'pg' | 'hostel' | 'mess'>('student');

  if (!showRoleModal || !pendingFirebaseUser) return null;

  const handleConfirm = async () => {
    const choice = CHOICES.find(c => c.id === selectedId) || CHOICES[0];
    await chooseRole(choice.role, choice.ownerType);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="role-select-title"
    >
      <div className="bg-white rounded-[24px] max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-scale-up">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-sky-100 text-navy-800 mx-auto flex items-center justify-center mb-3">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h2 id="role-select-title" className="text-xl sm:text-2xl font-bold text-navy-950 font-serif">
            Welcome to CampusNest!
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Hi {pendingFirebaseUser.displayName || 'there'}, please select your role to finish creating your account.
          </p>
        </div>

        {/* 4 Role Cards in a 2x2 Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6" role="radiogroup" aria-label="Account Role Selection">
          {CHOICES.map(c => {
            const isSelected = selectedId === c.id;
            const Icon = c.icon;
            return (
              <label
                key={c.id}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-navy-800 bg-sky-50/50 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className={`p-2 rounded-xl ${isSelected ? 'bg-navy-800 text-white' : 'bg-slate-100 text-slate-600'}`}>
                    <Icon size={18} />
                  </div>
                  <input
                    type="radio"
                    name="modalRoleChoice"
                    value={c.id}
                    checked={isSelected}
                    onChange={() => setSelectedId(c.id)}
                    className="sr-only"
                  />
                  {isSelected && (
                    <span className="w-5 h-5 rounded-full bg-navy-800 text-white flex items-center justify-center">
                      <Check size={12} strokeWidth={3} />
                    </span>
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-navy-950 text-sm">{c.title}</h4>
                  <p className="text-xs text-slate-500 mt-0.5 leading-snug">{c.desc}</p>
                </div>
              </label>
            );
          })}
        </div>

        {/* Role Notice */}
        <div className="p-3 bg-slate-50 rounded-xl mb-6 flex items-start gap-2.5 text-xs text-slate-600 border border-slate-200/60">
          <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
          <span>
            Your role is set when you register. Only an admin can change it later. Owner accounts need admin approval before listings go live.
          </span>
        </div>

        {/* Action Button */}
        <button
          type="button"
          disabled={loading}
          onClick={handleConfirm}
          className="w-full py-3 px-4 bg-navy-800 hover:bg-navy-900 active:bg-navy-950 text-white font-semibold rounded-full transition-all shadow-md hover:shadow-lg disabled:opacity-50 text-sm"
        >
          {loading ? 'Creating profile...' : 'Confirm Role & Continue'}
        </button>
      </div>
    </div>
  );
};
