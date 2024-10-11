// src/components/LinkButtons.js
import React from 'react';
import PropTypes from 'prop-types';

const LinkButtons = ({ user, linkTelegram, linkWallet }) => {
  const accountTypes = [
    { type: "telegram", displayName: "Telegram", linkMethod: linkTelegram },
    { type: "wallet", displayName: "Wallet", linkMethod: linkWallet },
  ];

  return (
    <div className="my-5">
      <h3 className="text-xl font-semibold mb-3">Link Accounts</h3>
      <div className="flex flex-col space-y-3">
        {accountTypes.map((accountType) => {
          const isLinked =
            accountType.type === "wallet"
              ? user?.linkedAccounts?.some((acc) => acc.type === "wallet") || user?.embeddedWallets?.length > 0
              : user?.linkedAccounts?.some((acc) => acc.type === accountType.type);
          const buttonClasses = `
            py-3 px-5 text-white rounded-md font-medium
            ${accountType.type === "telegram" || accountType.type === "login" ? 'bg-teal-600 hover:bg-teal-700' : ''}
            ${accountType.type === "link" ? 'bg-yellow-500 hover:bg-yellow-600' : ''}
            ${accountType.type === "unlink" ? 'bg-red-600 hover:bg-red-700' : ''}
          `;
          return (
            <button
              key={accountType.type}
              onClick={accountType.linkMethod}
              className={`${buttonClasses} disabled:bg-gray-400 disabled:cursor-not-allowed`}
              disabled={isLinked}
              aria-label={`Link ${accountType.displayName}`}
            >
              {isLinked ? `Linked ${accountType.displayName}` : `Link ${accountType.displayName}`}
            </button>
          );
        })}
      </div>
    </div>
  );
};

LinkButtons.propTypes = {
  user: PropTypes.object.isRequired,
  linkTelegram: PropTypes.func.isRequired,
  linkWallet: PropTypes.func.isRequired,
};

export default LinkButtons;
