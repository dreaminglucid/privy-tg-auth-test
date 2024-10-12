// frontend/src/App.jsx
import React from 'react';
import { PrivyProvider } from "@privy-io/react-auth";
import { QueryClient, QueryClientProvider } from 'react-query';
import { AuthProvider } from './contexts/AuthContext';
import Parent from './Parent';
import './index.css'; // Tailwind styles

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
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
          ],
        }}
      >
        <AuthProvider>
          <Parent />
        </AuthProvider>
      </PrivyProvider>
    </QueryClientProvider>
  );
}

export default App;