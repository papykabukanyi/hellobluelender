'use client';

import { useState, useEffect } from 'react';

const CookieConsent = () => {
  const [showConsent, setShowConsent] = useState(false);
  const [animation, setAnimation] = useState('');
  const [moreInfo, setMoreInfo] = useState(false);
  
  // Cookie categories
  const [cookieSettings, setCookieSettings] = useState({
    necessary: true, // Always required and enabled
    functional: false,
    analytics: false,
    marketing: false
  });
  
  useEffect(() => {
    // Check if user has already provided consent
    const consentGiven = localStorage.getItem('cookieConsent');
    
    if (!consentGiven) {
      // Short delay before showing for better UX
      const timer = setTimeout(() => {
        setShowConsent(true);
        setAnimation('animate-slideUp');
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, []);
  
  // Save consent in localStorage and set cookies accordingly
  const saveConsent = (acceptAll = false) => {
    const settings = acceptAll 
      ? { necessary: true, functional: true, analytics: true, marketing: true }
      : { ...cookieSettings, necessary: true };
    
    // Save consent in localStorage
    localStorage.setItem('cookieConsent', 'true');
    localStorage.setItem('cookieSettings', JSON.stringify(settings));
    
    // Save consent timestamp for compliance purposes
    localStorage.setItem('cookieConsentTimestamp', new Date().toISOString());
    
    // Set cookie with expiry date (1 year)
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    
    document.cookie = `cookieConsent=true; expires=${expiryDate.toUTCString()}; path=/; SameSite=Lax`;
    document.cookie = `cookieSettings=${JSON.stringify(settings)}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Lax`;
    
    // Hide the consent dialog with animation
    setAnimation('animate-slideDown');
    setTimeout(() => {
      setShowConsent(false);
    }, 500); // Match this with animation duration
    
    // Trigger a custom event that other scripts can listen for
    const event = new CustomEvent('cookieConsentUpdated', { detail: settings });
    window.dispatchEvent(event);
  };
  
  const handleToggle = (category) => {
    setCookieSettings(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };
  
  if (!showConsent) return null;
  
  return (
    <div 
      className={`fixed bottom-0 left-0 right-0 z-50 ${animation} shadow-lg`}
      style={{
        animation: animation === 'animate-slideUp' ? 'slideUp 0.5s forwards' : animation === 'animate-slideDown' ? 'slideDown 0.5s forwards' : 'none'
      }}
    >
      <div className="bg-white border-t-4 border-green-600 p-6 md:p-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <h2 className="text-xl font-bold mb-2 text-gray-800">We Value Your Privacy</h2>
            {!moreInfo ? (
              <p className="text-gray-600 mb-4">
                This website uses cookies to enhance your experience, analyze site traffic, and for marketing purposes. 
                By clicking "Accept All", you consent to our use of cookies. You can customize your preferences or 
                learn more in our Cookie Policy.
              </p>
            ) : (
              <div className="text-gray-600 mb-4 space-y-3">
                <p>
                  <strong>Necessary Cookies:</strong> Essential for website functionality. Cannot be disabled.
                </p>
                <p>
                  <strong>Functional Cookies:</strong> Remember your preferences to enhance your experience.
                </p>
                <p>
                  <strong>Analytics Cookies:</strong> Help us understand how visitors interact with our website.
                </p>
                <p>
                  <strong>Marketing Cookies:</strong> Allow us to deliver more relevant ads based on your interests.
                </p>
              </div>
            )}
            
            {moreInfo && (
              <div className="space-y-3 mt-4 mb-4">
                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input 
                      type="checkbox" 
                      checked={cookieSettings.necessary} 
                      disabled
                      className="h-5 w-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <span className="ml-2 text-gray-700">Necessary Cookies</span>
                  </label>
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded">Required</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input 
                      type="checkbox" 
                      checked={cookieSettings.functional} 
                      onChange={() => handleToggle('functional')}
                      className="h-5 w-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <span className="ml-2 text-gray-700">Functional Cookies</span>
                  </label>
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded">Optional</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input 
                      type="checkbox" 
                      checked={cookieSettings.analytics} 
                      onChange={() => handleToggle('analytics')}
                      className="h-5 w-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <span className="ml-2 text-gray-700">Analytics Cookies</span>
                  </label>
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded">Optional</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input 
                      type="checkbox" 
                      checked={cookieSettings.marketing} 
                      onChange={() => handleToggle('marketing')}
                      className="h-5 w-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <span className="ml-2 text-gray-700">Marketing Cookies</span>
                  </label>
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded">Optional</span>
                </div>
              </div>
            )}
            
            <button 
              onClick={() => setMoreInfo(!moreInfo)} 
              className="text-green-600 hover:text-green-800 font-medium underline text-sm"
            >
              {moreInfo ? 'Show Less' : 'Customize Settings'}
            </button>
          </div>
          
          <div className="flex flex-col md:flex-row gap-3 md:items-center flex-shrink-0">
            <button
              onClick={() => saveConsent(true)}
              className="btn bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-md"
            >
              Accept All
            </button>
            
            {moreInfo && (
              <button
                onClick={() => saveConsent(false)}
                className="btn bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-3 px-6 rounded-md"
              >
                Save Preferences
              </button>
            )}
            
            <button
              onClick={() => saveConsent(false)}
              className={`btn border border-gray-300 hover:bg-gray-50 text-gray-600 font-medium py-3 px-6 rounded-md ${moreInfo ? 'hidden md:block' : ''}`}
            >
              Necessary Cookies Only
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
