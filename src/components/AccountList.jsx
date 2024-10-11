// src/components/AccountList.js
import React from 'react';
import PropTypes from 'prop-types';

const AccountList = ({ user, handleUnlink, canUnlinkAccount, ensNames }) => {
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
        address: account.address
          ? `${account.address.slice(0, 6)}...${account.address.slice(-4)}`
          : "Unknown",
        chainType: account.chainType || "N/A",
        walletClientType: account.walletClientType || "N/A",
      }),
    },
  ];

  const renderAccount = (account, index, isEmbedded = false) => {
    const accountType = accountTypes.find((at) => at.type === account.type);
    if (!accountType) return null;

    const identifier = accountType.identifier(account);
    const details = accountType.details(account);

    return (
      <div key={`${isEmbedded ? 'embedded-' : ''}${index}`} className="flex justify-between items-center bg-white p-4 my-2 rounded-md shadow-sm">
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
                {ensNames[account.address.toLowerCase()]
                  ? `ENS Name: ${ensNames[account.address.toLowerCase()]}`
                  : `Address: ${details.address}`}
              </span>
              <span className="text-sm">
                Chain: {details.chainType}
              </span>
              <span className="text-sm">
                Client: {details.walletClientType}
              </span>
            </>
          )}
        </div>
        <button
          onClick={() => handleUnlink(accountType, identifier)}
          className={`py-2 px-4 text-white rounded-md font-medium
            bg-red-600 hover:bg-red-700
            ${!canUnlinkAccount ? 'bg-gray-400 cursor-not-allowed opacity-60' : ''}
          `}
          disabled={!canUnlinkAccount}
          aria-label={`Unlink ${accountType.displayName}${isEmbedded ? " (Embedded)" : ""}`}
        >
          Unlink
        </button>
      </div>
    );
  };

  if (!user?.linkedAccounts?.length && !user?.embeddedWallets?.length) {
    return <p className="text-center text-gray-500">No linked accounts.</p>;
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      {user.linkedAccounts?.map((account, index) => renderAccount(account, index))}
      {user.embeddedWallets?.map((wallet, index) => renderAccount({ ...wallet, type: "wallet" }, index, true))}
    </div>
  );
};

AccountList.propTypes = {
  user: PropTypes.object.isRequired,
  handleUnlink: PropTypes.func.isRequired,
  canUnlinkAccount: PropTypes.bool.isRequired,
  ensNames: PropTypes.object.isRequired,
};

export default AccountList;