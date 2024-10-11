// src/Parent.jsx
import React, { useMemo } from "react";
import { useAuth } from './contexts/AuthContext';
import useEnsNames from './hooks/useEnsNames';
import UserInfo from './components/UserInfo';
import LinkButtons from './components/LinkButtons';
import AccountList from './components/AccountList';

function Parent() {
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
    isInTelegram,
  } = useAuth();

  const linkedAccounts = useMemo(() => user?.linkedAccounts || [], [user]);
  const embeddedWallets = useMemo(() => user?.embeddedWallets || [], [user]);

  const allWallets = useMemo(() => {
    return linkedAccounts
      .filter(acc => acc.type === "wallet")
      .concat(embeddedWallets);
  }, [linkedAccounts, embeddedWallets]);

  const totalLinkedAccounts = linkedAccounts.length + embeddedWallets.length;

  const canUnlinkAccount = () => totalLinkedAccounts > 1;

  const walletAddresses = useMemo(
    () => allWallets.map(wallet => wallet.address),
    [allWallets]
  );

  const { data: ensNames, isLoading: isLoadingEns } = useEnsNames(
    walletAddresses,
    authenticated
  );

  const handleUnlink = async (accountType, identifier) => {
    if (!canUnlinkAccount()) {
      alert("Cannot unlink the last remaining account.");
      return;
    }

    try {
      if (accountType.type === "telegram") {
        await unlinkTelegram(identifier);
      } else if (accountType.type === "wallet") {
        await unlinkWallet(identifier);
      }
      alert(`${accountType.displayName} unlinked successfully.`);
    } catch (error) {
      console.error(`Error unlinking ${accountType.displayName}:`, error);
      alert(`Failed to unlink ${accountType.displayName}. Please try again.`);
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
          />
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