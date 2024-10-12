import React from 'react';
import PropTypes from 'prop-types';

const AccountList = ({ user, handleUnlink, canUnlinkAccount, ensNames, unlinkingAccount }) => {
  const accountTypes = [
    {
      type: "telegram",
      displayName: "Telegram",
      identifier: (account) => account.telegramUserId,
      details: (account) => ({
        username: account.username ? `@${account.username}` : "N/A",
        name: `${account.firstName} ${account.lastName || ""}`,
        telegramId: account.telegramUserId || "N/A",
        photoUrl: account.photoUrl || null,
      }),
    },
    {
      type: "wallet",
      displayName: "Wallet",
      identifier: (account) => account.address,
      details: (account) => ({
        address: account.address,
        chainType: account.chainType || "N/A",
        walletClientType: account.walletClientType || "N/A",
      }),
    },
    {
      type: "email",
      displayName: "Email",
      identifier: (account) => account.address,
      details: (account) => ({
        email: account.address || "N/A",
      }),
    },
  ];

  const renderAccount = (account, index, isEmbedded = false) => {
    const accountType = accountTypes.find((at) => at.type === account.type);
    if (!accountType) return null;

    const identifier = accountType.identifier(account);
    const details = accountType.details(account);
    const isUnlinking = unlinkingAccount === identifier;

    return (
      <div key={`${account.type}-${identifier}-${index}`} className="flex justify-between items-center bg-white p-4 my-2 rounded-md shadow-sm">
        <div className="flex flex-col">
          <span className="font-semibold text-lg">
            {accountType.displayName}{isEmbedded ? " (Embedded)" : ""}
          </span>
          {account.type === "telegram" && (
            <>
              {details.photoUrl && (
                <img
                  src={details.photoUrl}
                  alt={`${details.name}'s profile`}
                  className="rounded-full w-12 h-12 mt-2"
                />
              )}
              <span className="text-sm mt-2">
                {details.name} ({details.username})
              </span>
              <span className="text-sm">
                ID: {details.telegramId}
              </span>
            </>
          )}
          {account.type === "wallet" && (
            <>
              <span className="text-sm mt-2">
                {ensNames[details.address.toLowerCase()]
                  ? `ENS Name: ${ensNames[details.address.toLowerCase()]}`
                  : `Address: ${details.address.slice(0, 6)}...${details.address.slice(-4)}`}
              </span>
              <span className="text-sm">
                Chain: {details.chainType}
              </span>
              <span className="text-sm">
                Client: {details.walletClientType}
              </span>
            </>
          )}
          {account.type === "email" && (
            <span className="text-sm mt-2">
              Email: {details.email}
            </span>
          )}
        </div>
        <button
          onClick={() => handleUnlink(accountType, identifier)}
          className={`py-2 px-4 text-white rounded-md font-medium
            ${isUnlinking ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'}
            ${!canUnlinkAccount || isUnlinking ? 'opacity-60' : ''}
          `}
          disabled={!canUnlinkAccount || isUnlinking}
          aria-label={`Unlink ${accountType.displayName}${isEmbedded ? " (Embedded)" : ""}`}
        >
          {isUnlinking ? 'Unlinking...' : 'Unlink'}
        </button>
      </div>
    );
  };

  // Separate accounts by type
  const telegramAccounts = user.linkedAccounts?.filter(account => account.type === "telegram") || [];
  const walletAccounts = user.linkedAccounts?.filter(account => account.type === "wallet") || [];
  const embeddedWallets = user.embeddedWallets || [];
  
  // Handle email accounts
  const linkedEmailAccounts = user.linkedAccounts?.filter(account => account.type === "email") || [];
  const userEmail = user.email?.address ? { type: "email", address: user.email.address } : null;
  
  // Combine all email accounts, removing duplicates
  const allEmailAccounts = [...linkedEmailAccounts];
  if (userEmail && !allEmailAccounts.some(email => email.address === userEmail.address)) {
    allEmailAccounts.push(userEmail);
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      {telegramAccounts.map((account, index) => renderAccount(account, index))}
      {walletAccounts.map((account, index) => renderAccount(account, index))}
      {embeddedWallets.map((wallet, index) => renderAccount({ ...wallet, type: "wallet" }, index, true))}
      {allEmailAccounts.map((emailAccount, index) => renderAccount(emailAccount, index))}
    </div>
  );
};

AccountList.propTypes = {
  user: PropTypes.object.isRequired,
  handleUnlink: PropTypes.func.isRequired,
  canUnlinkAccount: PropTypes.bool.isRequired,
  ensNames: PropTypes.object.isRequired,
  unlinkingAccount: PropTypes.string,
};

export default AccountList;