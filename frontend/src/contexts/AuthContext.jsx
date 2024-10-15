// frontend/src/contexts/AuthContext.jsx
import React, { createContext, useContext, useEffect } from 'react';
import { usePrivy } from "@privy-io/react-auth";
import { useSetActiveWallet } from '@privy-io/wagmi'; // Import hook to set active wallet
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
    unlinkTelegram,
    linkWallet,
    unlinkWallet,
    linkEmail,
    unlinkEmail,
    getAccessToken,
    wallets,
  } = usePrivy();

  const { isInTelegram, setIsInTelegram } = useStore();
  const { setActiveWallet } = useSetActiveWallet(); // Get setActiveWallet function

  useEffect(() => {
    const checkTelegramWebApp = () => {
      if (window.Telegram?.WebApp?.initData) {
        setIsInTelegram(true);
        login();
      }
    };

    checkTelegramWebApp();
  }, [login, setIsInTelegram]);

  // Set the active wallet whenever the wallets change
  useEffect(() => {
    if (wallets && wallets.length > 0) {
      // You can set logic to choose which wallet to set as active
      setActiveWallet(wallets[0]);
    }
  }, [wallets, setActiveWallet]);

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
    linkEmail,
    unlinkEmail,
    isInTelegram,
    getAccessToken,
    wallets,
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
