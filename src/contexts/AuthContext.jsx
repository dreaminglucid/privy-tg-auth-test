// src/contexts/AuthContext.js
import React, { createContext, useContext, useEffect } from 'react';
import { usePrivy } from "@privy-io/react-auth";
import useStore from '../store/useStore';
import PropTypes from 'prop-types';

// Create the AuthContext
const AuthContext = createContext();

// Custom hook to consume AuthContext easily
export const useAuth = () => useContext(AuthContext);

// AuthProvider component that wraps around parts of the app that need access to auth
export const AuthProvider = ({ children }) => {
  const {
    ready,
    authenticated,
    user,
    login,
    logout,
    linkTelegram,
    unlinkTelegram,
    linkWallet,
    unlinkWallet,
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
    unlinkTelegram,
    linkWallet,
    unlinkWallet,
    isInTelegram,
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
