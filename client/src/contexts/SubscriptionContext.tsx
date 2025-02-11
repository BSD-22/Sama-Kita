import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { baseUrl } from '@/constants/baseUrl';

type SubscriptionContextType = {
  tier: 'FREE' | 'BASIC' | 'PREMIUM';
  loading: boolean;
  refetchSubscription: () => Promise<void>;
};

const SubscriptionContext = createContext<SubscriptionContextType>({
  tier: 'FREE',
  loading: true,
  refetchSubscription: async () => {},
});

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [tier, setTier] = useState<'FREE' | 'BASIC' | 'PREMIUM'>('FREE');
  const [loading, setLoading] = useState(true);

  const fetchSubscription = async () => {
    try {
      const { data } = await axios.get(`${baseUrl}/users/subscription`, {
        headers: { Authorization: `Bearer ${localStorage.access_token}` },
      });
      setTier(data.tier || 'FREE');
    } catch (error) {
      console.error('Error fetching subscription:', error);
      setTier('FREE');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, []);

  return (
    <SubscriptionContext.Provider value={{ tier, loading, refetchSubscription: fetchSubscription }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export const useSubscription = () => useContext(SubscriptionContext); 