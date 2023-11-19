import { useCurrentCompany, useJobs } from '@/front-provider/src';
import { CreateJob, CreateJob1 } from '@/utility/src';
import { useCallback, useState } from 'react';
import { createJob } from '../../services/jobs';

export const useCreateJob = () => {
  const [loading, setLoading] = useState(false);
  const { jobs1, setJobs1 } = useJobs();
  const { company } = useCurrentCompany();

  const createNewJob = useCallback(
    async (job1: Partial<CreateJob1>) => {
      setLoading(true);
      const res = await createJob({ ...job1, companyUuid: company?.uuid });
      if (jobs1) {
        setJobs1([...jobs1, res]);
      } else {
        setJobs1([res]);
      }
      setLoading(false);
    },
    [setJobs1]
  );

  return { loading, createNewJob };
};
