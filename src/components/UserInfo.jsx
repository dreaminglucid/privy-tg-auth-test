// src/components/UserInfo.js
import React from 'react';
import PropTypes from 'prop-types';

const UserInfo = ({ user }) => {
  const telegramAccount = user?.linkedAccounts?.find((acc) => acc.type === "telegram");
  if (!telegramAccount) return null;

  const details = {
    name: `${telegramAccount.firstName} ${telegramAccount.lastName || ""}`,
    username: telegramAccount.username ? `@${telegramAccount.username}` : "N/A",
    telegramId: telegramAccount.telegramUserId || "N/A",
    photoUrl: telegramAccount.photoUrl || null,
  };

  return (
    <div className="flex flex-col items-center mb-5">
      {details.photoUrl && (
        <img
          src={details.photoUrl}
          alt={`${details.name}'s profile`}
          className="rounded-full w-24 h-24 mb-2"
        />
      )}
      <div className="text-lg">
        <strong>Name:</strong> {details.name}
      </div>
      <div className="text-lg">
        <strong>Username:</strong> {details.username}
      </div>
      <div className="text-lg">
        <strong>Telegram ID:</strong> {details.telegramId}
      </div>
    </div>
  );
};

UserInfo.propTypes = {
  user: PropTypes.object.isRequired,
};

export default UserInfo;