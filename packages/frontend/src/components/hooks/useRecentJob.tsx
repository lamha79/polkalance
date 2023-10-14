import { useLanding } from '../../front-provider/src';
import { CreateJob, CreateJob1, UserTypeEnum } from '../../utility/src';
import { useCallback, useEffect, useState } from 'react';
import { getRecentJobs } from '../../services/search';

interface UseRecentJobProps {
  limit: number;
}

export const useRecentJob = ({ limit }: UseRecentJobProps) => {
  const [jobs1, setJobs1] = useState<CreateJob1[]>([]);
  const [loading, setLoading] = useState(true);
  const { type } = useLanding();

  const callGet = useCallback(async () => {
    setLoading(true);
    const res = await getRecentJobs({ limit });
    console.log(res);
    setJobs1(res);
    setLoading(false);
  }, [limit]);

  useEffect(() => {
    if (type === UserTypeEnum.Freelancer) {
      // callGet();
    }
  }, [callGet, type]);

  return { jobs1, loading };
};
