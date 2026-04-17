import React, { createContext, useState } from 'react';

export const TTSContext = createContext();

export const TTSProvider = ({ children }) => {
  // Global language state: 'en' for English, 'hi' for Hindi
  const [language, setLanguage] = useState('en');

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'en' ? 'hi' : 'en'));
  };

  return (
    <TTSContext.Provider value={{ language, setLanguage, toggleLanguage }}>
      {children}
    </TTSContext.Provider>
  );
};
