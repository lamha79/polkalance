import { useLanding } from '../../front-provider/src';
import { User, UserTypeEnum } from '../../utility/src';
import { useCallback, useEffect, useState } from 'react';
import { getRecentFreelancers } from '../services/search';

interface UseRecentFreelancerProps {
  limit: number;
}

export const useRecentFreelancer = ({ limit }: UseRecentFreelancerProps) => {
  const [freelancers, setFreelancers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { type } = useLanding();

  const callGet = useCallback(async () => {
    setLoading(true);
    const res = await getRecentFreelancers({ limit });
    setFreelancers(res);
    setLoading(false);
  }, [limit]);

  useEffect(() => {
    if (type === UserTypeEnum.Company) {
      // callGet();
    }
  }, [callGet, type]);

  return { freelancers, loading };
};
