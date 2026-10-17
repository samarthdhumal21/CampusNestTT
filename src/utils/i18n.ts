export type Language = 'en' | 'mr';

export interface Translations {
  collegesAndInstitutes: string;
  tagline: string;
  heroSubtext: string;
  findMyStay: string;
  explore: string;
  aboutAndData: string;
  budgetMatcher: string;
  signIn: string;
  createAccount: string;
  continueWithGoogle: string;
  signOut: string;
  myDashboard: string;
  searchCollegePlaceholder: string;
  student: string;
  owner: string;
  admin: string;
  pgOwner: string;
  hostelOwner: string;
  messOwner: string;
  studentDesc: string;
  pgOwnerDesc: string;
  hostelOwnerDesc: string;
  messOwnerDesc: string;
  roleNotice: string;
  verifyEmailTitle: string;
  verifyEmailDesc: string;
  iHaveVerified: string;
  resendVerification: string;
  demoModeBanner: string;
  savedShortlist: string;
  waitingForApproval: string;
  ownerSubmittedBadge: string;
  signedOutToast: string;
  categories: {
    engineering: string;
    medical: string;
    pharmacy: string;
    artsScienceCommerce: string;
    law: string;
    management: string;
    agriculture: string;
    diploma: string;
  };
}

export const translations: Record<Language, Translations> = {
  en: {
    collegesAndInstitutes: 'COLLEGES & INSTITUTES',
    tagline: 'Kolhapur Student Living Cost & Stay Finder',
    heroSubtext: 'Joining a college in Kolhapur? See your real monthly cost: rent + utilities + food + commute, before you arrive.',
    findMyStay: 'Find My Stay',
    explore: 'Explore',
    aboutAndData: 'About & Data',
    budgetMatcher: 'Budget Matcher',
    signIn: 'Sign In',
    createAccount: 'Create Account',
    continueWithGoogle: 'Continue with Google',
    signOut: 'Sign out',
    myDashboard: 'My Dashboard',
    searchCollegePlaceholder: 'Search college, course (MBBS, Law), or area...',
    student: 'Student',
    owner: 'Property Owner',
    admin: 'Administrator',
    pgOwner: 'PG Owner',
    hostelOwner: 'Hostel Owner',
    messOwner: 'Mess Owner',
    studentDesc: 'Find stays and messes, save your shortlist',
    pgOwnerDesc: 'List & manage paying guest rooms',
    hostelOwnerDesc: 'List & manage private student hostels',
    messOwnerDesc: 'List & manage student dining & tiffin',
    roleNotice: 'Your role is set when you register. Only an admin can change it later. Owner accounts need admin approval before listings go live.',
    verifyEmailTitle: 'Verify Your Email Address',
    verifyEmailDesc: 'We have sent a verification link to your email. Verification is required before saving data or adding listings.',
    iHaveVerified: "I've verified my email",
    resendVerification: 'Resend verification email',
    demoModeBanner: 'Demo mode: nothing is saved.',
    savedShortlist: 'Saved Shortlist',
    waitingForApproval: 'Waiting for Admin Approval',
    ownerSubmittedBadge: 'owner-submitted, not verified',
    signedOutToast: 'You have been signed out.',
    categories: {
      engineering: 'Engineering',
      medical: 'Medical',
      pharmacy: 'Pharmacy',
      artsScienceCommerce: 'Arts, Science & Commerce',
      law: 'Law',
      management: 'Management',
      agriculture: 'Agriculture',
      diploma: 'Diploma / Polytechnic'
    }
  },
  mr: {
    collegesAndInstitutes: 'महाविद्यालये व संस्था',
    tagline: 'कोल्हापूर विद्यार्थी राहण्याचा खर्च आणि निवास शोधक',
    heroSubtext: 'कोल्हापुरात महाविद्यालयात प्रवेश घेत आहात? येण्यापूर्वीच तुमचा खरा मासिक खर्च तपासा: भाडे + वीज/पाणी + मेस + प्रवास.',
    findMyStay: 'माझा निवास शोधा',
    explore: 'एक्सप्लोर करा',
    aboutAndData: 'माहिती व पारदर्शकता',
    budgetMatcher: 'बजेट मॅचर',
    signIn: 'साइन इन करा',
    createAccount: 'खाते तयार करा',
    continueWithGoogle: 'गुगलसह पुढे जा',
    signOut: 'साइन आउट',
    myDashboard: 'माझे डॅशबोर्ड',
    searchCollegePlaceholder: 'महाविद्यालय, अभ्यासक्रम (MBBS, Law), किंवा परिसर शोधा...',
    student: 'विद्यार्थी',
    owner: 'जागा मालक',
    admin: 'प्रशासक',
    pgOwner: 'पीजी (PG) मालक',
    hostelOwner: 'वसतिगृह मालक',
    messOwner: 'मेस मालक',
    studentDesc: 'निवास व मेस शोधा, आवडीच्या जागा जतन करा',
    pgOwnerDesc: 'पेइंग गेस्ट (PG) खोल्यांची यादी व व्यवस्थापन करा',
    hostelOwnerDesc: 'खाजगी विद्यार्थी वसतिगृहांची यादी व व्यवस्थापन करा',
    messOwnerDesc: 'विद्यार्थी भोजनालय व टिफिन सेवेची यादी करा',
    roleNotice: 'नोंदणी करताना तुमची भूमिका निश्चित केली जाते. केवळ प्रशासक ती नंतर बदलू शकतात. मालकांची यादी थेट दिसण्यापूर्वी प्रशासकीय मंजुरी आवश्यक आहे.',
    verifyEmailTitle: 'आपला ईमेल पत्ता सत्यापित करा',
    verifyEmailDesc: 'आम्ही आपल्या ईमेलवर पडताळणी लिंक पाठवली आहे. डेटा जतन करण्यासाठी किंवा जागा जोडण्यासाठी ईमेल पडताळणी आवश्यक आहे.',
    iHaveVerified: 'मी माझा ईमेल सत्यापित केला आहे',
    resendVerification: 'ईमेल पुन्हा पाठवा',
    demoModeBanner: 'डेमो मोड: काहीही जतन केले जात नाही.',
    savedShortlist: 'जतन केलेल्या जागा',
    waitingForApproval: 'प्रशासकीय मंजुरीची प्रतीक्षा',
    ownerSubmittedBadge: 'मालकाने सादर केलेले, असत्यापित',
    signedOutToast: 'आपण साइन आउट झाला आहात.',
    categories: {
      engineering: 'अभियांत्रिकी',
      medical: 'वैद्यकीय',
      pharmacy: 'फार्मसी',
      artsScienceCommerce: 'कला, विज्ञान आणि वाणिज्य',
      law: 'विधी / विधी महाविद्यालय',
      management: 'व्यवस्थापन',
      agriculture: 'कृषी महाविद्यालय',
      diploma: 'पॉलिटेक्निक / डिप्लोमा'
    }
  }
};
