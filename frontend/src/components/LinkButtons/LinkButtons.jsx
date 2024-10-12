// frontend/src/components/LinkButtons/LinkButtons.jsx
import React from 'react';
import PropTypes from 'prop-types';

const LinkButtons = ({ user, linkTelegram, linkWallet, linkEmail }) => {
  const accountTypes = [
    { type: "telegram", displayName: "Telegram", linkMethod: linkTelegram },
    { type: "wallet", displayName: "Wallet", linkMethod: linkWallet },
    { type: "email", displayName: "Email", linkMethod: linkEmail }, // Added Email
  ];

  return (
    <div className="my-5">
      <h3 className="text-xl font-semibold mb-3">Link Accounts</h3>
      <div className="flex flex-col space-y-3">
        {accountTypes.map((accountType) => {
          const isLinked =
            accountType.type === "wallet"
              ? user?.linkedAccounts?.some((acc) => acc.type === "wallet") || user?.embeddedWallets?.length > 0
              : accountType.type === "email"
              ? !!user?.email?.address
              : user?.linkedAccounts?.some((acc) => acc.type === accountType.type);
          
          const buttonClasses = `
            py-3 px-5 text-white rounded-md font-medium
            ${
              accountType.type === "telegram"
                ? 'bg-teal-600 hover:bg-teal-700'
                : accountType.type === "wallet"
                ? 'bg-yellow-500 hover:bg-yellow-600'
                : accountType.type === "email"
                ? 'bg-green-600 hover:bg-green-700'
                : ''
            }
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
  linkEmail: PropTypes.func.isRequired, // Add linkEmail prop
};

export default LinkButtons;