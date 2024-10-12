import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const FundWallet = () => {
  const { user, getAccessToken } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // State to track if wallet and email are linked
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Extract wallet address from linkedAccounts
    const walletAccount = user?.linkedAccounts?.find(acc => acc.type === 'wallet');
    const walletAddress = walletAccount?.address;

    // Extract email address
    const emailAddress = user?.email?.address;

    if (walletAddress && emailAddress) {
      setIsReady(true);
    } else {
      setIsReady(false);
    }
  }, [user]);

  const fundWallet = async () => {
    console.log('Backend URL:', process.env.REACT_APP_BACKEND_URL); // Debugging line
    console.log('User object:', user); // Existing debugging line

    // Extract wallet address from linkedAccounts
    const walletAccount = user?.linkedAccounts?.find(acc => acc.type === 'wallet');
    const walletAddress = walletAccount?.address;

    // Extract email address
    const emailAddress = user?.email?.address;

    const currentUrl = window.location.origin; // Redirect back after purchase

    if (!walletAddress || !emailAddress) {
      alert('Wallet address or email is missing. Please link your wallet and ensure your email is set.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const authToken = await getAccessToken();
      console.log('Auth Token:', authToken); // Debugging line

      if (!authToken) {
        throw new Error('No access token available. Please authenticate.');
      }

      const backendUrl = process.env.REACT_APP_BACKEND_URL;
      if (!backendUrl) {
        throw new Error('Backend URL is not defined. Please check your .env file.');
      }

      // Ensure no trailing slash in backendUrl
      const formattedBackendUrl = backendUrl.endsWith('/')
        ? backendUrl.slice(0, -1)
        : backendUrl;

      const response = await axios.post(
        `${formattedBackendUrl}/api/onramp`,
        {
          address: walletAddress,
          email: emailAddress,
          redirectUrl: currentUrl,
        },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const onrampUrl = response.data.url;

      if (onrampUrl) {
        // Redirect to fiat on-ramp URL in a new tab
        window.open(onrampUrl, '_blank');
      } else {
        setError('Failed to generate on-ramp URL.');
      }
    } catch (error) {
      console.error('Error initiating fiat on-ramp:', error);
      if (error.response) {
        // Server responded with a status other than 2xx
        setError(`Server Error: ${error.response.data.error || 'Unknown error.'}`);
      } else if (error.request) {
        // Request was made but no response received
        setError('No response from server. Please check your network connection.');
      } else {
        // Something else happened
        setError(`Error: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="my-5">
      <button
        onClick={fundWallet}
        className={`w-full py-3 text-white rounded-md transition-colors ${
          isReady
            ? 'bg-blue-600 hover:bg-blue-700'
            : 'bg-gray-400 cursor-not-allowed'
        }`}
        aria-label="Fund Wallet"
        disabled={!isReady || isLoading}
        title={!isReady ? 'Please link your wallet and email to fund your wallet.' : ''}
      >
        {isLoading ? 'Processing...' : 'Fund Wallet'}
      </button>
      {error && <p className="mt-2 text-red-500">{error}</p>}
      {!isReady && (
        <p className="mt-2 text-gray-500 text-sm">
          Please link your wallet and ensure your email is set before funding your wallet.
        </p>
      )}
    </div>
  );
};

export default FundWallet;