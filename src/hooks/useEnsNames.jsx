// src/hooks/useEnsNames.js
import { useQuery } from 'react-query';
import { fetchEnsNames } from '../utils/fetchEnsNames';

const useEnsNames = (walletAddresses, authenticated) => {
  return useQuery(
    ['ensNames', walletAddresses],
    () => fetchEnsNames(walletAddresses),
    {
      enabled: authenticated && walletAddresses.length > 0,
      staleTime: 1000 * 60 * 5, // 5 minutes
    }
  );
};

export default useEnsNames;