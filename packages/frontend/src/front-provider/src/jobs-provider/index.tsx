import { createContext, ReactNode, useEffect, useState } from 'react';
import { useContext } from 'react';
import { CreateJob, CreateJob1 } from '../../../utility/src';

type JobsContextInterface = {
  jobs1: CreateJob1[] | null;
  setJobs1: (jobs: CreateJob1[] | null) => void;
  jobs: CreateJob[] | null;
  setJobs: (jobs: CreateJob[] | null) => void;
  jobsFetching: boolean;
  setJobsFetching: (fetching: boolean) => void;
};

export const JobsContext = createContext<JobsContextInterface>({
  jobs: null,
  setJobs: () => {},
  jobs1: null,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setJobs1: () => {},
  jobsFetching: false,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setJobsFetching: () => {}
});

export const JobsProvider = ({ children }: { children: ReactNode }) => {
  const [jobs1, setJobs1] = useState<CreateJob1[] | null>(null);
  const [jobs, setJobs] = useState<CreateJob[] | null>(null);
  const [jobsFetching, setJobsFetching] = useState(false);

  return (
    <JobsContext.Provider value={{ jobs, setJobs, jobs1, setJobs1, jobsFetching, setJobsFetching }}>
      {children}
    </JobsContext.Provider>
  );
};

export function useJobs() {
  const { jobs, setJobs, jobs1, setJobs1, jobsFetching, setJobsFetching } = useContext(JobsContext);

  return { jobs, setJobs, jobs1, setJobs1, jobsFetching, setJobsFetching };
}
