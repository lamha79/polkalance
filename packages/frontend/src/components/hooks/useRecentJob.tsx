import { useLanding } from '../../front-provider/src';
import { CreateJob, CreateJob1, UserTypeEnum } from '../../utility/src';
import { useCallback, useEffect, useState } from 'react';
import { getRecentJobs, getRecentJobs1 } from '../../services/search';

interface UseRecentJobProps {
  limit: number;
}

export const useRecentJob = ({ limit }: UseRecentJobProps) => {
  const [jobs1, setJobs1] = useState<CreateJob1[]>([]);
  const [jobs, setJobs] = useState<CreateJob[]>([]);
  const [loading, setLoading] = useState(true);
  const { type } = useLanding();

  const callGet = useCallback(async () => {
    setLoading(true);
    const res1 = await getRecentJobs1({ limit });
    const res = await getRecentJobs({ limit });
    console.log(res);
    setJobs1(res1);
    setJobs(res);
    setLoading(false);
  }, [limit]);

  useEffect(() => {
    if (type === UserTypeEnum.Freelancer) {
      // callGet();
    }
  }, [callGet, type]);

  return { jobs, jobs1, loading };
};
