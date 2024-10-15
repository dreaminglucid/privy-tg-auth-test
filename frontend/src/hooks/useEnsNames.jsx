// src/hooks/useEnsNames.js
import { useQuery } from '@tanstack/react-query'; // Ensure correct import
import { fetchEnsNames } from '../utils/fetchEnsNames';

const useEnsNames = (walletAddresses, authenticated) => {
  return useQuery({
    queryKey: ['ensNames', walletAddresses],
    queryFn: () => fetchEnsNames(walletAddresses),
    enabled: authenticated && walletAddresses.length > 0,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export default useEnsNames;
