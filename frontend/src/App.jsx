// frontend/src/App.jsx
import React from 'react';
import { PrivyProvider } from '@privy-io/react-auth';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, createConfig } from '@privy-io/wagmi';
import { mainnet, sepolia } from 'viem/chains'; // Import chains from 'viem/chains'
import { http } from 'viem'; // Import 'http' from 'viem'
import { AuthProvider } from './contexts/AuthContext';
import Parent from './Parent';
import './index.css'; // Tailwind styles

const queryClient = new QueryClient();

// Create public clients for each chain
const publicClients = {
  [mainnet.id]: http(),
  [sepolia.id]: http(),
};

// Create wagmi config
const wagmiConfig = createConfig({
  autoConnect: true,
  chains: [mainnet, sepolia],
  publicClients,
});

function App() {
  return (
    <PrivyProvider
      appId={process.env.REACT_APP_PRIVY_APP_ID || ''}
      config={{
        loginMethods: [
          'wallet',
          'metamask',
          'coinbase',
          'walletconnect',
          'telegram',
          'email',
        ],
      }}
    >
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={wagmiConfig}>
          <AuthProvider>
            <Parent />
          </AuthProvider>
        </WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
}

export default App;
