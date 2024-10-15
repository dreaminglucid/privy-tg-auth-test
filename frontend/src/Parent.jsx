// src/Parent.jsx
import React, { useMemo, useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import useEnsNames from './hooks/useEnsNames';
import UserInfo from './components/UserInfo/UserInfo';
import LinkButtons from './components/LinkButtons/LinkButtons';
import AccountList from './components/AccountList/AccountList';
import FundWallet from './components/FundWallet/FundWallet';
import { useAccount, useSignMessage } from 'wagmi'; // Import wagmi hooks

function Parent() {
  const {
    ready,
    authenticated,
    user,
    login,
    logout,
    linkTelegram,
    linkWallet,
    unlinkTelegram,
    unlinkWallet,
    linkEmail,
    unlinkEmail,
    isInTelegram,
  } = useAuth();

  const [unlinkingAccount, setUnlinkingAccount] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState(null);

  const linkedAccounts = useMemo(() => user?.linkedAccounts || [], [user]);
  const embeddedWallets = useMemo(() => user?.embeddedWallets || [], [user]);

  const allWallets = useMemo(() => {
    return linkedAccounts
      .filter((acc) => acc.type === 'wallet')
      .concat(embeddedWallets);
  }, [linkedAccounts, embeddedWallets]);

  const totalLinkedAccounts = useMemo(() => {
    const linkedAccountTypes = new Set(linkedAccounts.map((acc) => acc.type));
    const hasEmail = !!user?.email?.address;

    let count = linkedAccountTypes.size;

    if (embeddedWallets.length > 0 && !linkedAccountTypes.has('wallet')) {
      count++;
    }

    if (hasEmail && !linkedAccountTypes.has('email')) {
      count++;
    }

    return count;
  }, [linkedAccounts, embeddedWallets, user]);

  const canUnlinkAccount = () => totalLinkedAccounts > 1;

  const walletAddresses = useMemo(
    () => allWallets.map((wallet) => wallet.address),
    [allWallets]
  );

  const { data: ensNames, isLoading: isLoadingEns } = useEnsNames(
    walletAddresses,
    authenticated
  );

  const { isConnected } = useAccount(); // Removed 'address' since it's unused
  const { signMessageAsync } = useSignMessage(); // Get signMessage function

  const signMessage = async () => {
    if (!isConnected) {
      console.error('No wallet connected');
      setFeedbackMessage({ type: 'error', text: 'No wallet connected.' });
      return;
    }
    try {
      const message = 'Hello, this is a test message!';
      const signature = await signMessageAsync({ message });
      console.log('Signature:', signature);
      setFeedbackMessage({ type: 'success', text: 'Message signed successfully!' });
    } catch (error) {
      console.error('Error signing message:', error);
      setFeedbackMessage({ type: 'error', text: 'Failed to sign message.' });
    }
  };

  const handleUnlink = async (accountType, identifier) => {
    if (!canUnlinkAccount()) {
      setFeedbackMessage({ type: 'error', text: 'Cannot unlink the last remaining account.' });
      setTimeout(() => setFeedbackMessage(null), 5000);
      return;
    }

    setUnlinkingAccount(identifier);
    setFeedbackMessage(null);

    try {
      let result;
      if (accountType.type === 'telegram') {
        result = await unlinkTelegram(identifier);
      } else if (accountType.type === 'wallet') {
        result = await unlinkWallet(identifier);
      } else if (accountType.type === 'email') {
        result = await unlinkEmail(identifier);
      }

      if (result) {
        setFeedbackMessage({
          type: 'success',
          text: `${accountType.displayName} unlinked successfully.`,
        });
      } else {
        throw new Error('Unlinking failed');
      }
    } catch (error) {
      console.error(`Error unlinking ${accountType.displayName}:`, error);
      setFeedbackMessage({
        type: 'error',
        text: `Failed to unlink ${accountType.displayName}. Please try again.`,
      });
    } finally {
      setUnlinkingAccount(null);
      setTimeout(() => setFeedbackMessage(null), 5000);
    }
  };

  if (!ready) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-xl text-gray-700">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      {authenticated ? (
        <div className="w-full max-w-2xl p-5 bg-white rounded-md shadow-md">
          <UserInfo user={user} />
          <div className="mb-5 text-lg">
            <strong>Total linked accounts:</strong> {totalLinkedAccounts}
          </div>
          <button
            onClick={logout}
            className="w-full py-3 bg-teal-600 text-white rounded-md mb-5 hover:bg-teal-700 transition-colors"
            aria-label="Log Out"
          >
            Log Out
          </button>
          <LinkButtons
            user={user}
            linkTelegram={linkTelegram}
            linkWallet={linkWallet}
            linkEmail={linkEmail}
          />
          {/* Add the Sign Message button */}
          <button
            onClick={signMessage}
            className="w-full py-3 bg-blue-600 text-white rounded-md mb-5 hover:bg-blue-700 transition-colors"
            aria-label="Sign Message"
          >
            Sign Test Message
          </button>
          <FundWallet />
          {feedbackMessage && (
            <div
              className={`mt-4 p-3 rounded-md ${
                feedbackMessage.type === 'success'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              }`}
            >
              {feedbackMessage.text}
            </div>
          )}
          <div className="mt-8">
            <h3 className="text-2xl font-semibold mb-4">Linked Accounts</h3>
            {isLoadingEns ? (
              <p className="text-center text-gray-500">Loading ENS names...</p>
            ) : (
              <AccountList
                user={user}
                handleUnlink={handleUnlink}
                canUnlinkAccount={canUnlinkAccount()}
                ensNames={ensNames || {}}
                unlinkingAccount={unlinkingAccount}
              />
            )}
          </div>
        </div>
      ) : (
        <div className="w-full max-w-md p-5 bg-white rounded-md shadow-md text-center">
          <h2 className="text-2xl font-semibold mb-5">Welcome!</h2>
          {!isInTelegram && (
            <button
              onClick={login}
              className="w-full py-3 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
              aria-label="Log In"
            >
              Log In
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default Parent;
