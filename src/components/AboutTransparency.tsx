import React from 'react';
import { ShieldCheck, Info, Database, Calculator, Heart, Code2, Users, AlertCircle } from 'lucide-react';
import { FIRESTORE_COLLECTIONS } from '../services/firebase';

export const AboutTransparency: React.FC = () => {
  return (
    <div className="section-wrapper">
      <div className="section-header">
        <h2 className="section-title">About CampusNest & Data Transparency</h2>
        <p className="section-desc">
          Built for the hackathon by a 2-student team to solve the painful living cost uncertainty faced by all Kolhapur students moving to the city.
        </p>
      </div>

      {/* 1. Hackathon Mission Card */}
      <div className="transparency-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.85rem' }}>
          <Heart size={22} color="#2563eb" />
          <h3 style={{ fontSize: '1.25rem' }}>The Kolhapur Student Living Challenge</h3>
        </div>
        <p style={{ color: '#475569', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '1rem' }}>
          Every year, thousands of students from Sangli, Satara, Solapur, Pune, Konkan, and beyond relocate to Kolhapur to attend premier institutions across 
          <strong> Medical, Engineering, Pharmacy, Arts/Commerce/Science, Law, Management, Agriculture, and Polytechnic disciplines</strong> (including 
          GMC CPR, DYPCET, DOT Shivaji University, KITCoEK, Vivekanand College, Rajaram, CSIBER, Shahaji Law, and more). 
          Most students only look at the room rent (e.g. ₹3,000/mo) and fail to anticipate the compulsory extra costs: 
          <strong> monthly meal mess (₹2,200 – ₹2,800), electricity & water utilities (₹400 – ₹600), and daily commute costs (₹0 – ₹800)</strong>.
        </p>
        <p style={{ color: '#475569', fontSize: '0.92rem', lineHeight: 1.6 }}>
          CampusNest was built to solve this exact problem: an honest, transparent recommendation engine that calculates your true 
          <strong> Total Monthly Living Cost</strong> before you move.
        </p>
      </div>

      {/* 2. Data Transparency & Safety Guarantee */}
      <div className="transparency-card" style={{ borderLeft: '4px solid #f59e0b' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.85rem' }}>
          <ShieldCheck size={22} color="#d97706" />
          <h3 style={{ fontSize: '1.25rem', color: '#92400e' }}>Data Transparency & Demo Disclaimer</h3>
        </div>
        <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '10px', padding: '1rem', marginBottom: '1rem', fontSize: '0.88rem', color: '#78350f' }}>
          <strong>Notice to Hackathon Evaluators & Students:</strong> All property names, room listings, mess facilities, and owner contact details currently in CampusNest are 
          <strong> illustrative sample seed records</strong> modeled after real Kolhapur localities (Kasaba Bawada, Rajarampuri, Vidyanagar, Gokul Shirgaon, Shahupuri). 
          They do not claim live verified vacancies or disclose private citizen data.
        </div>
        <ul style={{ color: '#475569', fontSize: '0.88rem', lineHeight: 1.6, paddingLeft: '1.25rem' }}>
          <li><strong>No Fake Vacancies:</strong> We do not fabricate false rental agreements or collect reservation payments.</li>
          <li><strong>Zero Private Phone Numbers:</strong> All telephone numbers are marked with explicit demo flags (e.g. <code>+91 98XXX XXXXX</code>).</li>
          <li><strong>No Hidden Algorithms:</strong> Every recommendation result displays the exact math equation used to compute the total monthly cost.</li>
        </ul>
      </div>

      {/* 3. Cost Calculation Methodology */}
      <div className="transparency-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.85rem' }}>
          <Calculator size={22} color="#059669" />
          <h3 style={{ fontSize: '1.25rem' }}>How We Calculate Monthly Cost</h3>
        </div>
        <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '1rem' }}>
          <div style={{ fontFamily: 'monospace', fontSize: '1.05rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem' }}>
            Total Monthly Cost = Room Rent + Estimated Utilities + Food/Mess Cost + Estimated Transport
          </div>
          <div style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5 }}>
            • <strong>Food Included Stays:</strong> Stays with internal catering have Food Cost = ₹0 extra (factored directly into room fee).<br />
            • <strong>Separate Mess Stays:</strong> Paired with the most economical/proximate mess serving that locality.<br />
            • <strong>Estimated Transport to Campus:</strong><br />
            &nbsp;&nbsp; - ≤ 1.0 km: ₹0/mo (Walking distance)<br />
            &nbsp;&nbsp; - 1.1 to 3.0 km: ₹350/mo (Bicycle maintenance / shared auto)<br />
            &nbsp;&nbsp; - 3.1 to 6.0 km: ₹800/mo (KMT Kolhapur Municipal Transport monthly student bus pass)<br />
            &nbsp;&nbsp; - &gt; 6.0 km: ₹1,400/mo (Suburban bus / two-wheeler fuel)<br />
            • <strong>One-Time Security Deposit:</strong> Kept strictly separate from the monthly recurring budget check.
          </div>
        </div>
      </div>

      {/* 4. Firebase Cloud Firestore Migration Architecture */}
      <div className="transparency-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.85rem' }}>
          <Database size={22} color="#2563eb" />
          <h3 style={{ fontSize: '1.25rem' }}>Google Cloud Firestore Architecture</h3>
        </div>
        <p style={{ color: '#475569', fontSize: '0.9rem', marginBottom: '1rem', lineHeight: 1.5 }}>
          To allow our project to transition seamlessly to production without altering the recommendation engine or UI components, 
          the application uses a <strong>Repository Pattern</strong>. 
          Our service layer maps directly to Firestore collections:
        </p>

        <div className="code-snippet">
          <pre>{`// Firestore Collections Mapping:
1. '${FIRESTORE_COLLECTIONS.COLLEGES}'       -> College metadata, locations & campus landmarks (34 colleges)
2. '${FIRESTORE_COLLECTIONS.ACCOMMODATIONS}' -> Room listings, rents, deposits & college distance vectors
3. '${FIRESTORE_COLLECTIONS.MESS_LISTINGS}'  -> Mess menus, food types, monthly plans & locality matrices
4. 'users/{uid}'           -> Minimal user profiles (uid, displayName, email, photoURL, role, ownerStatus)
5. 'users/{uid}/shortlist' -> Saved student stays`}</pre>
        </div>
      </div>

      {/* 5. Privacy Policy & Google Auth Guarantee */}
      <div className="transparency-card" style={{ borderLeft: '4px solid #10b981' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.85rem' }}>
          <ShieldCheck size={22} color="#059669" />
          <h3 style={{ fontSize: '1.25rem', color: '#065f46' }}>Privacy & Google Authentication Guarantee</h3>
        </div>
        <p style={{ color: '#475569', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '0.75rem' }}>
          CampusNest values student and landlord privacy. We use official Google Sign-In exclusively through Firebase Authentication. We store <strong>only</strong> the minimal fields required to operate your account:
        </p>
        <ul style={{ color: '#475569', fontSize: '0.88rem', lineHeight: 1.6, paddingLeft: '1.25rem', marginBottom: '1rem' }}>
          <li><strong>Name (displayName):</strong> To greet you on your personal dashboard.</li>
          <li><strong>Email Address:</strong> To identify your account uniquely across devices.</li>
          <li><strong>Profile Photo (photoURL):</strong> To display your avatar in the navigation bar.</li>
          <li><strong>Role & Verification Status:</strong> Student, Property Owner (pending/approved), or Admin.</li>
          <li><strong>Saved Shortlist:</strong> Listing IDs of the stays you bookmark.</li>
        </ul>
        <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '10px', padding: '0.85rem 1rem', fontSize: '0.85rem', color: '#065f46' }}>
          <strong>Zero Password Exposure:</strong> We never see, handle, or store your Google password. Authentication is carried out directly on Google's secure OAuth consent servers. Student emails are never shown to property owners, and security boundaries are enforced server-side via Firestore Security Rules.
        </div>
      </div>

      {/* 5. Hackathon Credits */}
      <div style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)', color: 'white', borderRadius: '16px', padding: '2rem', textAlign: 'center' }}>
        <h3 style={{ fontSize: '1.4rem', marginBottom: '0.5rem', color: 'white' }}>CampusNest Hackathon Team</h3>
        <p style={{ maxWidth: '600px', margin: '0 auto 1.5rem', opacity: 0.9, fontSize: '0.92rem' }}>
          Created as an MVP for student living transparency in Kolhapur, Maharashtra. Designed with React 19, TypeScript, Vite, and clean modular architecture.
        </p>
        <div style={{ display: 'inline-flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', fontSize: '0.85rem' }}>
          <span style={{ background: 'rgba(255, 255, 255, 0.15)', padding: '0.4rem 0.85rem', borderRadius: '9999px' }}>
            ⚡ 2-Member Team Collaboration
          </span>
          <span style={{ background: 'rgba(255, 255, 255, 0.15)', padding: '0.4rem 0.85rem', borderRadius: '9999px' }}>
            🎯 Budget-Based Recommendation Engine
          </span>
          <span style={{ background: 'rgba(255, 255, 255, 0.15)', padding: '0.4rem 0.85rem', borderRadius: '9999px' }}>
            📱 Mobile-First Responsive
          </span>
        </div>
      </div>
    </div>
  );
};
