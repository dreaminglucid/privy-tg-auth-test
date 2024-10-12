// frontend/src/contexts/AuthContext.jsx
import React, { createContext, useContext, useEffect } from 'react';
import { usePrivy } from "@privy-io/react-auth";
import useStore from '../store/useStore';
import PropTypes from 'prop-types';

// Create AuthContext
const AuthContext = createContext();

// Custom hook to use AuthContext
export const useAuth = () => useContext(AuthContext);

// AuthProvider component
export const AuthProvider = ({ children }) => {
  const {
    ready,
    authenticated,
    user,
    login,
    logout,
    linkTelegram,
    unlinkTelegram,   // Ensure this is destructured
    linkWallet,
    unlinkWallet,     // Ensure this is destructured
    linkEmail,        // Add linkEmail if available
    unlinkEmail,      // Add unlinkEmail if available
    getAccessToken,
  } = usePrivy();

  const { isInTelegram, setIsInTelegram } = useStore();

  useEffect(() => {
    const checkTelegramWebApp = () => {
      if (window.Telegram?.WebApp?.initData) {
        setIsInTelegram(true);
        login();
      }
    };

    checkTelegramWebApp();
  }, [login, setIsInTelegram]);

  const value = {
    ready,
    authenticated,
    user,
    login,
    logout,
    linkTelegram,
    unlinkTelegram,   // Provide unlinkTelegram in context
    linkWallet,
    unlinkWallet,     // Provide unlinkWallet in context
    linkEmail,        // Provide linkEmail in context
    unlinkEmail,      // Provide unlinkEmail in context
    isInTelegram,
    getAccessToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AuthContext;