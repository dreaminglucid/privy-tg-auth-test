import React, { useState, useEffect, useMemo } from "react";
import "./App.css";
import { usePrivy, PrivyProvider } from "@privy-io/react-auth";

function App() {
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

  const [ensNames, setEnsNames] = useState({});
  const [isInTelegram, setIsInTelegram] = useState(false);

  const linkedAccounts = useMemo(() => user?.linkedAccounts || [], [user]);
  const embeddedWallets = useMemo(() => user?.embeddedWallets || [], [user]);

  const allWallets = useMemo(() => {
    return linkedAccounts.filter(acc => acc.type === "wallet").concat(embeddedWallets);
  }, [linkedAccounts, embeddedWallets]);

  const totalLinkedAccounts = linkedAccounts.length + embeddedWallets.length;

  const canUnlinkAccount = () => totalLinkedAccounts > 1;

  useEffect(() => {
    const checkTelegramWebApp = () => {
      if (window.Telegram?.WebApp?.initData) {
        setIsInTelegram(true);
        login();
      }
    };

    checkTelegramWebApp();
  }, [login]);

  useEffect(() => {
    const fetchEnsNames = async () => {
      const newEnsNames = { ...ensNames };
      const queries = allWallets.map(async (wallet) => {
        const address = wallet.address.toLowerCase();
        if (!newEnsNames[address]) {
          try {
            const response = await fetch("https://api.thegraph.com/subgraphs/name/ensdomains/ens", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                query: `
                  query($address: String!) {
                    domains(where: { resolvedAddress: $address }) {
                      name
                    }
                  }
                `,
                variables: { address },
              }),
            });
            const data = await response.json();
            if (data.data && data.data.domains && data.data.domains.length > 0) {
              newEnsNames[address] = data.data.domains.map(domain => domain.name).join(", ");
            } else {
              newEnsNames[address] = null;
            }
          } catch (error) {
            console.error(`Error fetching ENS name for ${address}:`, error);
            newEnsNames[address] = null;
          }
        }
      });
      await Promise.all(queries);
      setEnsNames(newEnsNames);
    };

    if (allWallets.length > 0) {
      fetchEnsNames();
    }
  }, [allWallets, ensNames]);

  const accountTypes = [
    {
      type: "telegram",
      displayName: "Telegram",
      linkMethod: linkTelegram,
      unlinkMethod: unlinkTelegram,
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
      linkMethod: linkWallet,
      unlinkMethod: unlinkWallet,
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

  const handleUnlink = async (accountType, identifier) => {
    if (!canUnlinkAccount()) {
      alert("Cannot unlink the last remaining account.");
      return;
    }

    try {
      await accountType.unlinkMethod(identifier);
      alert(`${accountType.displayName} unlinked successfully.`);
    } catch (error) {
      console.error(`Error unlinking ${accountType.displayName}:`, error);
      alert(`Failed to unlink ${accountType.displayName}. Please try again.`);
    }
  };

  const renderLinkedAccounts = () => {
    if (linkedAccounts.length === 0 && embeddedWallets.length === 0) {
      return <p>No linked accounts.</p>;
    }

    return (
      <div className="linked-accounts">
        {linkedAccounts.map((account, index) => {
          const accountType = accountTypes.find((at) => at.type === account.type);
          if (!accountType) return null;

          const identifier = accountType.identifier(account);
          const details = accountType.details(account);

          return (
            <div key={index} className="linked-account">
              <div className="linked-account-info">
                <span className="linked-account-type">{accountType.displayName}</span>
                {account.type === "telegram" && (
                  <>
                    {details.photoUrl && (
                      <img
                        src={details.photoUrl}
                        alt={`${details.name}'s profile`}
                        style={{ borderRadius: "50%", width: "50px", height: "50px", marginTop: "5px" }}
                      />
                    )}
                    <span className="linked-account-details">
                      {details.name} ({details.username})
                    </span>
                    <span className="linked-account-details">ID: {details.telegramId}</span>
                  </>
                )}
                {account.type === "wallet" && (
                  <>
                    <span className="linked-account-details">
                      {ensNames[account.address.toLowerCase()]
                        ? `ENS Name: ${ensNames[account.address.toLowerCase()]}`
                        : `Address: ${details.address}`}
                    </span>
                    <span className="linked-account-details">Chain: {details.chainType}</span>
                    <span className="linked-account-details">Client: {details.walletClientType}</span>
                  </>
                )}
              </div>
              <button
                onClick={() => handleUnlink(accountType, identifier)}
                className={`button unlink ${!canUnlinkAccount() ? "disabled" : ""}`}
                disabled={!canUnlinkAccount()}
                aria-label={`Unlink ${accountType.displayName}`}
              >
                Unlink
              </button>
            </div>
          );
        })}

        {embeddedWallets.map((wallet, index) => {
          const accountType = accountTypes.find((at) => at.type === "wallet");
          if (!accountType) return null;

          const identifier = accountType.identifier(wallet);
          const details = accountType.details(wallet);

          return (
            <div key={`embedded-${index}`} className="linked-account">
              <div className="linked-account-info">
                <span className="linked-account-type">{accountType.displayName} (Embedded)</span>
                <span className="linked-account-details">
                  {ensNames[wallet.address.toLowerCase()]
                    ? `ENS Name: ${ensNames[wallet.address.toLowerCase()]}`
                    : `Address: ${details.address}`}
                </span>
                <span className="linked-account-details">Chain: {details.chainType}</span>
                <span className="linked-account-details">Client: {details.walletClientType}</span>
              </div>
              <button
                onClick={() => handleUnlink(accountType, identifier)}
                className={`button unlink ${!canUnlinkAccount() ? "disabled" : ""}`}
                disabled={!canUnlinkAccount()}
                aria-label={`Unlink ${accountType.displayName} (Embedded)`}
              >
                Unlink
              </button>
            </div>
          );
        })}
      </div>
    );
  };

  const renderLinkButtons = () => {
    return (
      <div className="section">
        <h3>Link Accounts</h3>
        {accountTypes.map((accountType) => {
          const isLinked =
            accountType.type === "wallet"
              ? linkedAccounts.some((acc) => acc.type === "wallet") || embeddedWallets.length > 0
              : linkedAccounts.some((acc) => acc.type === accountType.type);
          return (
            <button
              key={accountType.type}
              onClick={accountType.linkMethod}
              className="button link"
              disabled={isLinked}
              aria-label={`Link ${accountType.displayName}`}
            >
              {isLinked ? `Linked ${accountType.displayName}` : `Link ${accountType.displayName}`}
            </button>
          );
        })}
      </div>
    );
  };

  const renderUserInfo = () => {
    const telegramAccount = linkedAccounts.find((acc) => acc.type === "telegram");
    if (!telegramAccount) return null;

    const details = accountTypes
      .find((at) => at.type === "telegram")
      ?.details(telegramAccount);

    return (
      <div className="user-info">
        {details.photoUrl && (
          <img
            src={details.photoUrl}
            alt={`${details.name}'s profile`}
            style={{ borderRadius: "50%", width: "100px", height: "100px", marginBottom: "10px" }}
          />
        )}
        <div className="user-detail">
          <strong>Name:</strong> {details.name}
        </div>
        <div className="user-detail">
          <strong>Username:</strong> {details.username}
        </div>
        <div className="user-detail">
          <strong>Telegram ID:</strong> {details.telegramId}
        </div>
      </div>
    );
  };

  if (!ready) {
    return (
      <div className="App">
        <header className="App-header">
          <p>Loading...</p>
        </header>
      </div>
    );
  }

  return (
    <div className="App">
      <header className="App-header">
        {authenticated ? (
          <div style={{ maxWidth: "600px", margin: "0 auto", padding: "20px", textAlign: "center" }}>
            {renderUserInfo()}
            <div style={{ marginBottom: "20px", fontSize: "18px" }}>
              <strong>Total linked accounts:</strong> {totalLinkedAccounts}
            </div>
            <button onClick={logout} className="button logout" aria-label="Log Out">
              Log Out
            </button>
            {renderLinkButtons()}
            <div className="section">
              <h3>Linked Accounts</h3>
              {renderLinkedAccounts()}
            </div>
          </div>
        ) : (
          <div style={{ maxWidth: "400px", margin: "0 auto", padding: "20px", textAlign: "center" }}>
            <h2>Welcome!</h2>
            {!isInTelegram && (
              <button onClick={login} className="button login" aria-label="Log In">
                Log In
              </button>
            )}
          </div>
        )}
      </header>
    </div>
  );
}

function WrappedApp() {
  return (
    <PrivyProvider
      appId={process.env.REACT_APP_PRIVY_APP_ID || ""}
      config={{
        loginMethods: [
          "wallet",
          "metamask",
          "coinbase",
          "walletconnect",
          "telegram",
          "email",
          "google",
        ],
      }}
    >
      <App />
    </PrivyProvider>
  );
}

export default WrappedApp;