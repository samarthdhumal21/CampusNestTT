import React, { useState, useMemo, useEffect } from 'react';
import { Navbar, NavTabType } from './components/Navbar';
import { Hero } from './components/Hero';
import { FeaturesBento } from './components/FeaturesBento';
import { HowItWorks } from './components/HowItWorks';
import { FeaturedStaysCarousel } from './components/FeaturedStaysCarousel';
import { WhyCampusNest } from './components/WhyCampusNest';
import { ContactFeedback } from './components/ContactFeedback';
import { SectionLabel } from './components/SectionLabel';
import { RecommendationWizard } from './components/RecommendationWizard';
import { ResultsList } from './components/ResultsList';
import { CostBreakdownModal } from './components/CostBreakdownModal';
import { ComparisonDrawer } from './components/ComparisonDrawer';
import { ExploreCatalog } from './components/ExploreCatalog';
import { AboutTransparency } from './components/AboutTransparency';
import { Footer } from './components/Footer';

import { AuthProvider, useAuth } from './context/AuthContext';
import { RoleSelectModal } from './components/auth/RoleSelectModal';
import { OwnerMigrationModal } from './components/auth/OwnerMigrationModal';
import { SignInModal } from './components/auth/SignInModal';
import { BottomRightAuthWidget } from './components/auth/BottomRightAuthWidget';
import { AuthForm } from './components/auth/AuthForm';
import { DemoModeBanner } from './components/DemoModeBanner';
import { TopSearchBar } from './components/TopSearchBar';
import { ProtectedRoute } from './components/dashboard/ProtectedRoute';
import { StudentDashboard } from './components/dashboard/StudentDashboard';
import { OwnerDashboard } from './components/dashboard/OwnerDashboard';
import { AdminDashboard } from './components/dashboard/AdminDashboard';

import { accommodationsData } from './data/accommodations';
import { messesData } from './data/messes';
import { collegesData } from './data/colleges';
import { generateRecommendations, findBestPairedMess, calculateMonthlyTransport } from './utils/recommendationEngine';
import { AccommodationListing, RecommendationResult, SearchPreferences } from './types';
import { formatINR } from './utils/formatters';
import { X, CheckCircle } from 'lucide-react';

const AppContent: React.FC = () => {
  const { user, signedOutNotice, clearSignedOutNotice } = useAuth();
  const [activeTab, setActiveTab] = useState<NavTabType>('home');
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);

  // Search Preferences State
  const [preferences, setPreferences] = useState<SearchPreferences>({
    collegeId: 'dypcet',
    monthlyBudget: 6500,
    foodPreference: 'either',
    accommodationType: 'all',
    maxDistanceKm: 5,
    gender: 'all',
    hostelFor: 'any'
  });

  // Detailed Modal View State
  const [selectedResult, setSelectedResult] = useState<RecommendationResult | null>(null);

  // Side-by-Side Comparison State
  const [comparedResults, setComparedResults] = useState<RecommendationResult[]>([]);
  const [isCompareDrawerOpen, setIsCompareDrawerOpen] = useState(false);

  // Sync initial URL pathname to activeTab and listen to popstate
  useEffect(() => {
    const syncPath = () => {
      const path = window.location.pathname;
      if (path === '/auth') {
        setActiveTab('auth');
      } else if (path === '/dashboard/student') {
        setActiveTab('dashboard-student');
      } else if (path === '/dashboard/owner') {
        setActiveTab('dashboard-owner');
      } else if (path === '/dashboard/admin') {
        setActiveTab('dashboard-admin');
      } else if (path === '/find') {
        setActiveTab('find');
      } else if (path === '/explore') {
        setActiveTab('explore');
      } else if (path === '/about') {
        setActiveTab('about');
      }
    };
    syncPath();
    window.addEventListener('popstate', syncPath);
    return () => window.removeEventListener('popstate', syncPath);
  }, []);

  // Update browser history when activeTab changes
  const handleTabChange = (tab: NavTabType) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    let newPath = '/';
    if (tab === 'auth') newPath = '/auth';
    else if (tab === 'find') newPath = '/find';
    else if (tab === 'explore') newPath = '/explore';
    else if (tab === 'about') newPath = '/about';
    else if (tab === 'dashboard-student') newPath = '/dashboard/student';
    else if (tab === 'dashboard-owner') newPath = '/dashboard/owner';
    else if (tab === 'dashboard-admin') newPath = '/dashboard/admin';

    if (window.location.pathname !== newPath) {
      window.history.pushState(null, '', newPath);
    }
  };

  // Auto-dismiss signed-out toast after 4.5 seconds
  useEffect(() => {
    if (signedOutNotice) {
      const timer = setTimeout(() => {
        clearSignedOutNotice();
      }, 4500);
      return () => clearTimeout(timer);
    }
  }, [signedOutNotice, clearSignedOutNotice]);

  // Dynamic Recommendation Engine Evaluation
  const recommendationOutput = useMemo(() => {
    return generateRecommendations(preferences, accommodationsData, messesData);
  }, [preferences]);

  // Comparison Handlers
  const handleToggleCompare = (result: RecommendationResult) => {
    if (comparedResults.some(r => r.id === result.id)) {
      setComparedResults(prev => prev.filter(r => r.id !== result.id));
    } else {
      if (comparedResults.length >= 3) {
        alert('You can compare a maximum of 3 stays side-by-side.');
        return;
      }
      setComparedResults(prev => [...prev, result]);
      setIsCompareDrawerOpen(true);
    }
  };

  const handleRemoveCompareItem = (id: string) => {
    setComparedResults(prev => prev.filter(r => r.id !== id));
  };

  const handleClearCompare = () => {
    setComparedResults([]);
    setIsCompareDrawerOpen(false);
  };

  // Reset Filters
  const handleResetFilters = () => {
    setPreferences({
      collegeId: preferences.collegeId,
      monthlyBudget: 6500,
      foodPreference: 'either',
      accommodationType: 'all',
      maxDistanceKm: 8,
      gender: 'all',
      hostelFor: 'any'
    });
  };

  const handleFindStayClick = (collegeId?: string) => {
    if (collegeId) {
      setPreferences(prev => ({ ...prev, collegeId }));
    }
    handleTabChange('find');
  };

  const handleOpenAccommodationDetails = (acc: AccommodationListing) => {
    const collegeDist = acc.collegesServed.find(cs => cs.collegeId === preferences.collegeId) || acc.collegesServed[0];
    const pairedMess = acc.foodIncluded ? undefined : findBestPairedMess(acc, messesData);
    const transport = calculateMonthlyTransport(collegeDist.distanceKm);
    const foodCost = acc.foodIncluded ? 0 : (pairedMess ? pairedMess.monthlyMealPrice : 2400);
    const totalMonthly = acc.monthlyRent + acc.monthlyUtilities + foodCost + transport.cost;

    let formulaText = '';
    if (acc.foodIncluded) {
      formulaText = `Rent ${formatINR(acc.monthlyRent)} + utilities ${formatINR(acc.monthlyUtilities)} + food included ${formatINR(0)} + transport ${formatINR(transport.cost)} = estimated ${formatINR(totalMonthly)}/month`;
    } else {
      const messName = pairedMess ? pairedMess.name : 'Mess';
      formulaText = `Rent ${formatINR(acc.monthlyRent)} + utilities ${formatINR(acc.monthlyUtilities)} + mess (${messName}) ${formatINR(foodCost)} + transport ${formatINR(transport.cost)} = estimated ${formatINR(totalMonthly)}/month`;
    }

    const res: RecommendationResult = {
      id: `${acc.id}-modal`,
      accommodation: acc,
      pairedMess,
      distanceToChosenCollege: collegeDist.distanceKm,
      breakdown: {
        rent: acc.monthlyRent,
        utilities: acc.monthlyUtilities,
        foodCost,
        transportCost: transport.cost,
        transportMode: transport.mode,
        totalMonthly,
        deposit: acc.oneTimeDeposit,
        formulaText
      },
      isWithinBudget: preferences.monthlyBudget >= totalMonthly,
      budgetDelta: preferences.monthlyBudget - totalMonthly,
      matchReasons: [
        `${collegeDist.distanceKm} km from chosen campus`,
        acc.highlight
      ],
      valueScore: 100
    };

    setSelectedResult(res);
  };

  return (
    <div className="app-container">
      {/* Demo Mode Persistent Warning Banner */}
      <DemoModeBanner />

      {/* Toast Notice on Sign-out */}
      {signedOutNotice && (
        <div 
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 bg-navy-950 text-white px-4 py-3 rounded-2xl shadow-2xl border border-navy-800 flex items-center gap-3 animate-fade-in"
        >
          <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span className="text-xs font-medium">{signedOutNotice}</span>
          <button
            type="button"
            onClick={clearSignedOutNotice}
            className="text-slate-400 hover:text-white ml-2"
            aria-label="Dismiss message"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Floating Glass Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        savedCompareCount={comparedResults.length}
        openCompareDrawer={() => setIsCompareDrawerOpen(true)}
      />

      {/* Sticky Top Search Bar Below Navbar On Every Page */}
      <TopSearchBar
        onSelectCollege={handleFindStayClick}
        onViewAllColleges={() => handleTabChange('explore')}
      />

      {/* Main Content Area */}
      <main className="main-content">
        {/* TAB 1: HOME PAGE */}
        {activeTab === 'home' && (
          <div>
            {/* 1. Hero Section with New Palace Kolhapur Background & College Strip */}
            <Hero
              selectedCollegeId={preferences.collegeId}
              onFindStayClick={handleFindStayClick}
              onExploreClick={() => handleTabChange('explore')}
              onNavigateDashboard={() => {
                if (!user) return;
                const tab = user.role === 'admin' ? 'dashboard-admin' : user.role === 'owner' ? 'dashboard-owner' : 'dashboard-student';
                handleTabChange(tab);
              }}
            />

            {/* 2. Features Bento Grid */}
            <FeaturesBento />

            {/* 3. How It Works Section */}
            <HowItWorks onFindStayClick={() => handleFindStayClick()} />

            {/* 4. Live Budget Matching Engine Preview on Homepage */}
            <section id="matcher-section" className="ecoriz-section">
              <div className="section-container">
                <SectionLabel label="Interactive Matcher" />
                <div className="section-heading-group">
                  <h2 className="section-main-heading">Test Your Monthly Living Budget</h2>
                  <p className="section-sub-heading">
                    Adjust the college, budget slider, or meal preferences to instantly see ranked stays and matching messes.
                  </p>
                </div>

                <RecommendationWizard
                  preferences={preferences}
                  onPreferencesChange={setPreferences}
                />

                <ResultsList
                  withinBudget={recommendationOutput.withinBudget}
                  overBudgetAlternatives={recommendationOutput.overBudgetAlternatives}
                  preferences={preferences}
                  onResetFilters={handleResetFilters}
                  onOpenDetails={setSelectedResult}
                  comparedResults={comparedResults}
                  onToggleCompare={handleToggleCompare}
                />
              </div>
            </section>

            {/* 5. Featured Stays Carousel */}
            <FeaturedStaysCarousel onOpenDetails={handleOpenAccommodationDetails} />

            {/* 6. Why CampusNest & Trust Quotes */}
            <WhyCampusNest />

            {/* 7. Contact & Inquiries */}
            <ContactFeedback />
          </div>
        )}

        {/* TAB 2: FIND MY STAY (DEDICATED MATCHER PAGE) */}
        {activeTab === 'find' && (
          <div className="ecoriz-section">
            <div className="section-container">
              <SectionLabel label="Budget Engine" />
              <div className="section-heading-group">
                <h1 className="section-main-heading">Find My Stay — Kolhapur Living Matcher</h1>
                <p className="section-sub-heading">
                  Filter by college, monthly budget limit, and meal options. Our engine ranks options within budget first, then provides closest alternatives if needed.
                </p>
              </div>

              <RecommendationWizard
                preferences={preferences}
                onPreferencesChange={setPreferences}
              />

              <ResultsList
                withinBudget={recommendationOutput.withinBudget}
                overBudgetAlternatives={recommendationOutput.overBudgetAlternatives}
                preferences={preferences}
                onResetFilters={handleResetFilters}
                onOpenDetails={setSelectedResult}
                comparedResults={comparedResults}
                onToggleCompare={handleToggleCompare}
              />
            </div>
          </div>
        )}

        {/* TAB 3: EXPLORE ALL LISTINGS CATALOG */}
        {activeTab === 'explore' && (
          <div className="ecoriz-section">
            <div className="section-container">
              <ExploreCatalog
                onOpenAccommodationDetails={handleOpenAccommodationDetails}
              />
            </div>
          </div>
        )}

        {/* TAB 4: ABOUT & DATA TRANSPARENCY */}
        {activeTab === 'about' && (
          <div className="ecoriz-section">
            <div className="section-container">
              <AboutTransparency />
            </div>
          </div>
        )}

        {/* TAB: DEDICATED /auth ROUTE PAGE VIEW */}
        {activeTab === 'auth' && (
          <div className="auth-page-container">
            <div className="auth-page-card">
              <AuthForm
                variant="page"
                onSuccess={(targetPath) => {
                  if (targetPath) {
                    if (targetPath === '/dashboard/admin') handleTabChange('dashboard-admin');
                    else if (targetPath === '/dashboard/owner') handleTabChange('dashboard-owner');
                    else handleTabChange('dashboard-student');
                  } else if (user) {
                    const tab = user.role === 'admin' ? 'dashboard-admin' : user.role === 'owner' ? 'dashboard-owner' : 'dashboard-student';
                    handleTabChange(tab);
                  } else {
                    handleTabChange('home');
                  }
                }}
                onNavigateDashboard={(targetPath) => {
                  if (targetPath === '/dashboard/admin') handleTabChange('dashboard-admin');
                  else if (targetPath === '/dashboard/owner') handleTabChange('dashboard-owner');
                  else handleTabChange('dashboard-student');
                }}
              />
            </div>
          </div>
        )}

        {/* TAB 5: STUDENT DASHBOARD (PROTECTED) */}
        {activeTab === 'dashboard-student' && (
          <ProtectedRoute
            requiredRole="student"
            onGoHome={() => handleTabChange('home')}
            onGoUserDashboard={() => handleTabChange('dashboard-student')}
            onOpenSignIn={() => setIsSignInModalOpen(true)}
          >
            <StudentDashboard
              onFindStayClick={handleFindStayClick}
              onOpenDetails={handleOpenAccommodationDetails}
            />
          </ProtectedRoute>
        )}

        {/* TAB 6: OWNER DASHBOARD (PROTECTED) */}
        {activeTab === 'dashboard-owner' && (
          <ProtectedRoute
            requiredRole="owner"
            onGoHome={() => handleTabChange('home')}
            onGoUserDashboard={() => handleTabChange('dashboard-owner')}
            onOpenSignIn={() => setIsSignInModalOpen(true)}
          >
            <OwnerDashboard />
          </ProtectedRoute>
        )}

        {/* TAB 7: ADMIN DASHBOARD (PROTECTED) */}
        {activeTab === 'dashboard-admin' && (
          <ProtectedRoute
            requiredRole="admin"
            onGoHome={() => handleTabChange('home')}
            onGoUserDashboard={() => handleTabChange('dashboard-admin')}
            onOpenSignIn={() => setIsSignInModalOpen(true)}
          >
            <AdminDashboard />
          </ProtectedRoute>
        )}
      </main>

      {/* Cost Breakdown Details Modal */}
      <CostBreakdownModal
        result={selectedResult}
        college={collegesData.find(c => c.id === preferences.collegeId) || collegesData[0]}
        onClose={() => setSelectedResult(null)}
      />

      {/* Side-by-Side Comparison Drawer */}
      <ComparisonDrawer
        isOpen={isCompareDrawerOpen}
        onClose={() => setIsCompareDrawerOpen(false)}
        comparedResults={comparedResults}
        onRemoveItem={handleRemoveCompareItem}
        onClearAll={handleClearCompare}
        onOpenDetails={setSelectedResult}
      />

      {/* First-Time Sign-In Role Selection Modal (Student vs Owner) */}
      <RoleSelectModal />

      {/* One-Time Migration Modal for Owners without ownerType */}
      <OwnerMigrationModal />

      {/* Sign-in Modal Triggered from Access Guards or Navbar */}
      <SignInModal
        isOpen={isSignInModalOpen}
        onClose={() => setIsSignInModalOpen(false)}
      />

      {/* Footer */}
      <Footer
        onSelectTab={tab => handleTabChange(tab)}
        onSelectCollege={handleFindStayClick}
      />

      {/* Docked Sign-In Box at Bottom Right (hidden on dedicated /auth page) */}
      {activeTab !== 'auth' && (
        <BottomRightAuthWidget
          onNavigateDashboard={() => {
            if (user?.role === 'admin') handleTabChange('dashboard-admin');
            else if (user?.role === 'owner') handleTabChange('dashboard-owner');
            else handleTabChange('dashboard-student');
          }}
        />
      )}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
