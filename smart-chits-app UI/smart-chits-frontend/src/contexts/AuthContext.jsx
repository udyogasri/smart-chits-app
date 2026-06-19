import React, { createContext, useContext, useState, useEffect } from 'react'
import { login as apiLogin, register as apiRegister, getCurrentUser, logout as apiLogout, isAuthenticated, isTokenExpired, clearAuthStorage, updateUserSettings } from '../services/authService'

const AuthContext = createContext()

export function useAuth() {
  return useContext(AuthContext)
}

const translations = {
  English: {
    dashboard: 'Dashboard',
    listOfChits: 'List of Chits',
    chitsDetails: 'Chits Details',
    settings: 'Settings',
    payments: 'Payments',
    paymentHistory: 'Payment History',
    logout: 'Logout',
    profileSettings: 'Profile Settings',
    security: 'Security',
    notifications: 'Notifications',
    preferences: 'Preferences',
    statements: 'Download Statements',
    support: 'Contact Support',
    saveChanges: 'Save Changes',
    firstName: 'First Name',
    lastName: 'Last Name',
    emailAddress: 'Email Address',
    phoneNumber: 'Phone Number',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    createAccount: 'Create Account',
    signIn: 'Sign In',
    signUp: 'Sign Up',
    welcomeBack: 'Welcome back to your account',
    joinToday: 'Join Smart Chits today',
    language: 'Language',
    timezone: 'Timezone',
    currency: 'Currency',
    yourChitMemberships: 'Your Chit Memberships',
    viewDetails: 'View Details',
    totalAmount: 'Total Amount',
    monthlyContribution: 'Monthly Contribution',
    paid: 'Paid',
    remaining: 'Remaining',
    makePayment: 'Make Payment',
    viewPaymentHistory: 'View Payment History',
    searchTransactions: 'Search transactions',
    date: 'Date',
    plan: 'Plan',
    amount: 'Amount',
    status: 'Status',
    method: 'Method',
    pendingPayments: 'Pending Payments',
    payNow: 'Pay Now',
    quickPayment: 'Quick Payment',
    processPayment: 'Process Payment',
    searchChits: 'Search chits by name, organizer, or description...',
    allStatus: 'All Status',
    active: 'Active',
    upcoming: 'Upcoming',
    completed: 'Completed',
    totalChits: 'Total Chits',
    chitName: 'Chit Name',
    organizer: 'Organizer',
    duration: 'Duration',
    members: 'Members',
    monthly: 'Monthly',
    nextAuction: 'Next Auction',
    noChitsFound: 'No chits found matching your criteria'
  },
  Hindi: {
    dashboard: 'डैशबोर्ड',
    listOfChits: 'चिट्स की सूची',
    chitsDetails: 'चिट विवरण',
    settings: 'सेटिंग्स',
    payments: 'भुगतानियाँ',
    paymentHistory: 'भुगतानी इतिहास',
    logout: 'लॉग आउट',
    profileSettings: 'प्रोफाइल सेटिंग्स',
    security: 'सुरक्षा',
    notifications: 'सूचनाएं',
    preferences: 'प्राथमितियाँ',
    statements: 'विवरण डाउनलोड करें',
    support: 'संपर्क ग्राहक',
    saveChanges: 'परिवर्तन सहेजें',
    firstName: 'पहला नाम',
    lastName: 'अंतिम नाम',
    emailAddress: 'ईमेल पता',
    phoneNumber: 'फोन नंबर',
    password: 'पासवर्ड',
    confirmPassword: 'पासवर्ड की पुष्टि करें',
    createAccount: 'खाता बनाएं',
    signIn: 'साइन इन करें',
    signUp: 'साइन अप करें',
    welcomeBack: 'आपके खाते में आपका स्वागत है',
    joinToday: 'आज ही स्मार्ट चिट्स से जुड़ें',
    language: 'भाषा',
    timezone: 'टाइमजोन',
    currency: 'मुद्रा',
    yourChitMemberships: 'आपकी चिट सदस्यता',
    viewDetails: 'विवरण देखें',
    totalAmount: 'कुल राशि',
    monthlyContribution: 'मासिक योगदान',
    paid: 'भुगतान',
    remaining: 'शेष',
    makePayment: 'भुगतान करें',
    viewPaymentHistory: 'भुगतानी इतिहास देखें',
    searchTransactions: 'लेन-देन खोजें',
    date: 'तारीख',
    plan: 'योजना',
    amount: 'राशि',
    status: 'स्थिति',
    method: 'विधि',
    pendingPayments: 'लंबित भुगतानियाँ',
    payNow: 'अभी भुगतान करें',
    quickPayment: 'तुरंत भुगतान',
    processPayment: 'भुगतान प्रक्रिया करें',
    searchChits: 'नाम, आयोजक, या विवरण से चिट्स खोजें...',
    allStatus: 'सभी स्थिति',
    active: 'सक्रिय',
    upcoming: 'आगामी',
    completed: 'पूर्ण',
    totalChits: 'कुल चिट्स',
    chitName: 'चिट का नाम',
    organizer: 'आयोजक',
    duration: 'अवधि',
    members: 'सदस्य',
    monthly: 'मासिक',
    nextAuction: 'अगली नीलामी',
    noChitsFound: 'आपकी शर्तों से मेल खाते कोई चिट्स नहीं मिले'
  },
  Tamil: {
    dashboard: 'டகரைப்போர்டு',
    listOfChits: 'சிட்களின் பட்டியல்',
    chitsDetails: 'சிட் விவரணங்கள்',
    settings: 'அமைப்புகள்',
    payments: 'கட்டுதல்கள்',
    paymentHistory: 'கட்டுதல் வரலாறு',
    logout: 'வெளியேறு',
    profileSettings: 'சுயரேசை அமைப்புகள்',
    security: 'பாதுகாப்பு',
    notifications: 'அறிவிப்புகள்',
    preferences: 'விருப்புகள்',
    statements: 'விவரணங்களை பதிவிறக்க',
    support: 'ஆதரவு உதவிக்கை தொடர்க',
    saveChanges: 'மாற்றங்களை சேமிக்க',
    firstName: 'முதல் பெயர்',
    lastName: 'கடைசி பெயர்',
    emailAddress: 'மின்னமெயில் முகவரி',
    phoneNumber: 'தொலைபோன் எண்',
    password: 'கடவுச்சொல்',
    confirmPassword: 'கடவுச்சொல்லை உறுதியாக',
    createAccount: 'கணக்கை உருவாக்க',
    signIn: 'உள்நுழைய',
    signUp: 'பதிவு செய்ய',
    welcomeBack: 'உங்களின் கணக்கிற்கு வரவுக',
    joinToday: 'இன்று ஸ்மார்ட் சிட்ஸில் சேர',
    language: 'மொழி',
    timezone: 'நேர மண்டலம்',
    currency: 'நாணயம்',
    yourChitMemberships: 'உங்களின் சிட் உறுப்புகள்',
    viewDetails: 'விவரணங்களைப் பார்க்க',
    totalAmount: 'மொத்த தொகை',
    monthlyContribution: 'மாதிய பங்களிப்பு',
    paid: 'கட்டுதல்',
    remaining: 'மீதம்',
    makePayment: 'கட்டுதல் செய்ய',
    viewPaymentHistory: 'கட்டுதல் வரலாற்சைப் பார்க்க',
    searchTransactions: 'பரிவரைகளைத் தேட',
    date: 'தேதி',
    plan: 'திட்டம்',
    amount: 'தொகை',
    status: 'நிலை',
    method: 'முறை',
    pendingPayments: 'நிலுள்ள கட்டுதல்கள்',
    payNow: 'இப்போது கட்டுதல் செய்ய',
    quickPayment: 'விரைவாய கட்டுதல்',
    processPayment: 'கட்டுதல் செயலாய்பு',
    searchChits: 'பெயர், ஏற்பாட்டாளர், அல்லது விவரணம் மூலம் சிட்களைத் தேட...',
    allStatus: 'அனைத்து நிலை',
    active: 'செயலில்',
    upcoming: 'வரவிருக்கும்',
    completed: 'முடிந்தது',
    totalChits: 'மொத்த சிட்கள்',
    chitName: 'சிட் பெயர்',
    organizer: 'ஏற்பாட்டாளர்',
    duration: 'காலம்',
    members: 'உறுப்பினர்கள்',
    monthly: 'மாதாந்திர',
    nextAuction: 'அடுத்த ஏலம்',
    noChitsFound: 'உங்கள் நிபந்தனைகளுக்கு பொருந்தும் சிட்கள் ஏதும் கிடைக்கவில்லை'
  },
  Telugu: {
    dashboard: 'డాష్బోర్డ్',
    listOfChits: 'చిట్ల జాబితా',
    chitsDetails: 'చిట్ల వివరాలు',
    settings: 'సెట్టింగ్స్',
    payments: 'చెల్లింపులు',
    paymentHistory: 'చెల్లింపుల చరిత్ర',
    logout: 'లాగ్ అవుట్',
    profileSettings: 'ప్రొఫైల్ సెట్టింగ్స్',
    security: 'భద్రత',
    notifications: 'నోటిఫికేషన్లు',
    preferences: 'ప్రాఫరెన్సెస్',
    statements: 'స్టేట్మెంట్లను డౌన్లోడ్ చేయండి',
    support: 'సపోర్ట్ సంప్రదించండి',
    saveChanges: 'మార్పులను సేవ్ చేయండి',
    firstName: 'మొదటి పేరు',
    lastName: 'చివరి పేరు',
    emailAddress: 'ఇమెయిల్ చిరునా',
    phoneNumber: 'ఫోన్ నంబర్',
    password: 'పాస్వర్డ్',
    confirmPassword: 'పాస్వర్డ్ను నిర్ధారించండి',
    createAccount: 'ఖాతాను సృష్టించండి',
    signIn: 'సైన్ ఇన్ చేయండి',
    signUp: 'సైన్ అప్ చేయండి',
    welcomeBack: 'మీ ఖాతాకు మీకు స్వాగతం',
    joinToday: 'ఈరోజు స్మార్ట్ చిట్స్లో చేరండి',
    language: 'భాష',
    timezone: 'టైమ్‌జోన్',
    currency: 'కరెన్సీ',
    yourChitMemberships: 'మీ చిట్ సభ్యతులు',
    viewDetails: 'వివరాలు చూడండి',
    totalAmount: 'మొత్త మొత్తం',
    monthlyContribution: 'నెలకరల సహాయం',
    paid: 'చెల్లింపబడినది',
    remaining: 'మిగిలి ఉన్నది',
    makePayment: 'చెల్లింపు చేయండి',
    viewPaymentHistory: 'చెల్లింపుల చరిత్ర చూడండి',
    searchTransactions: 'లావణాలును శోధించండి',
    date: 'తేది',
    plan: 'ప్రణాళిక',
    amount: 'మొత్తం',
    status: 'స్థితి',
    method: 'పద్దతి',
    pendingPayments: 'నిలుళ్ళ చెల్లింపులు',
    payNow: 'ఇప్పోతు చెల్లింపు చేయండి',
    quickPayment: 'వేగి చెల్లింపు',
    processPayment: 'చెల్లింపు ప్రక్రియ చేయండి',
    searchChits: 'పేరు, ఆర్గనైజర్, లేదా వివరణ ద్వారా చిట్లను శోధించండి...',
    allStatus: 'అన్ని స్థితులు',
    active: 'చురుకుగా',
    upcoming: 'రాబోయే',
    completed: 'పూర్తయింది',
    totalChits: 'మొత్తం చిట్లు',
    chitName: 'చిట్ పేరు',
    organizer: 'ఆర్గనైజర్',
    duration: 'కాలం',
    members: 'సభ్యులు',
    monthly: 'నెలవారీ',
    nextAuction: 'తదుపరి వేలం',
    noChitsFound: 'మీ ప్రమాణాలకు సరిపోయే చిట్లు ఏవీ కనుగొనబడలేదు'
  }
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [token, setToken] = useState(null)
  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentLanguage, setCurrentLanguage] = useState('English')

  // Load user data and language preference on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check if user is authenticated from localStorage
        const savedToken = localStorage.getItem('authToken')
        const savedUser = localStorage.getItem('user')
        const savedRole = localStorage.getItem('userRole')
        
        if (savedToken && isTokenExpired(savedToken)) {
          clearAuthStorage()
        } else if (savedToken && savedUser && savedRole) {
          setToken(savedToken)
          // Normalize role
          const normalizedRole = savedRole.toLowerCase().replace(/_/g, '')
          setRole(normalizedRole)
          const parsedUser = JSON.parse(savedUser)
          // Restore avatar from localStorage if available
          const savedAvatar = localStorage.getItem('userAvatar')
          if (savedAvatar && !parsedUser.avatar) {
            parsedUser.avatar = savedAvatar
          }
          setCurrentUser(parsedUser)
        } else if (isAuthenticated()) {
          // Fetch current user from backend if we have token but no user data
          const userData = await getCurrentUser()
          setCurrentUser(userData)
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error)
        // If token is invalid, clear it
        localStorage.removeItem('authToken')
        localStorage.removeItem('user')
        localStorage.removeItem('userRole')
        setToken(null)
        setRole(null)
        setCurrentUser(null)
      } finally {
        setLoading(false)
      }
    }

    // Load saved language preference
    const savedLanguage = localStorage.getItem('preferredLanguage')
    if (savedLanguage) {
      setCurrentLanguage(savedLanguage)
    }

    initializeAuth()
  }, [])

  const signup = async (userData) => {
    try {
      const response = await apiRegister(userData)
      // After successful registration, navigate to login page
      return response
    } catch (error) {
      console.error('Signup failed:', error)
      throw error
    }
  }

  const login = async (email, password) => {
    try {
      const response = await apiLogin(email, password)
      
      // Store token
      if (response.access_token) {
        setToken(response.access_token)
        localStorage.setItem('authToken', response.access_token)
      }
      
      // Store role (normalize to handle both 'superadmin' and 'super_admin')
      if (response.role) {
        const normalizedRole = response.role.toLowerCase().replace(/_/g, '')
        setRole(normalizedRole)
        localStorage.setItem('userRole', normalizedRole)
      }
      
      // Store user data
      if (response.user) {
        setCurrentUser(response.user)
        localStorage.setItem('user', JSON.stringify(response.user))
        // Store avatar separately for quick access
        if (response.user.avatar) {
          localStorage.setItem('userAvatar', response.user.avatar)
        }
      }
      
      return response
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    }
  }

  const updateUserProfile = async (updatedData) => {
    try {
      // Save to backend
      await updateUserSettings(updatedData)
      
      // Refresh user data from backend to get latest state
      const updatedUser = await getCurrentUser()
      
      // Update local state with fresh data from backend
      setCurrentUser(updatedUser)
      
      // Update localStorage with the updated user data
      localStorage.setItem('user', JSON.stringify(updatedUser))
      
      // Store avatar separately for quick access if present
      if (updatedUser.avatar) {
        localStorage.setItem('userAvatar', updatedUser.avatar)
      }
      
      return updatedUser
    } catch (error) {
      console.error('Failed to update user profile:', error)
      throw error
    }
  }

  const logout = async () => {
    try {
      apiLogout()
      setCurrentUser(null)
      setToken(null)
      setRole(null)
    } catch (error) {
      console.error('Logout failed:', error)
      // Even if API call fails, clear local state
      setCurrentUser(null)
      setToken(null)
      setRole(null)
      localStorage.removeItem('authToken')
      localStorage.removeItem('user')
      localStorage.removeItem('userRole')
      localStorage.removeItem('userAvatar')
    }
  }

  const t = (key) => {
    return translations[currentLanguage]?.[key] || translations.English[key] || key
  }

  const changeLanguage = (language) => {
    setCurrentLanguage(language)
    localStorage.setItem('preferredLanguage', language)
  }

  const value = {
    currentUser,
    token,
    role,
    loading,
    currentLanguage,
    changeLanguage,
    t,
    signup,
    login,
    logout,
    updateUserProfile,
    isAuthenticated: !!token && !!currentUser
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
