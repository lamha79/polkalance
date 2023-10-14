/* eslint-disable @typescript-eslint/no-empty-function */
import { useCurrentUser, useLanding } from '../../front-provider/src';
import { CreateJob, CreateJob1, UserTypeEnum } from '../../utility/src';
import { searchFreelancers, searchFreelancersLogged, convertJsonToArray, searchJobs } from '../../services/search';
import { createContext, ReactNode, useContext, useState, useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';
import { ContractIds } from '@/deployments/deployments';
import {
  contractQuery,
  decodeOutput,
  useInkathon,
  useRegisteredContract,
} from '@scio-labs/use-inkathon'

type SearchJobContextInterface = {
  jobs1: CreateJob1[];
  jobs: CreateJob[];
  setJobs1: (users: CreateJob1[]) => void;
  setJobs: (users: CreateJob[]) => void;
  totalResult: number;
  setTotalResult: (result: number) => void;
  searchFilters: string[];
  setSearchFilters: (filters: string[]) => void;
  elementByPage: number;
  setElementByPage: (elementByPage: number) => void;
  maxPage: number;
  setMaxPage: (maxPage: number) => void;
  curPage: number;
  setCurPage: (curPage: number) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
};

export const SearchJobContext = createContext<SearchJobContextInterface>({
  jobs: [],
  jobs1: [],
  setJobs: () => {},
  setJobs1: () => {},
  totalResult: 0,
  setTotalResult: () => {},
  searchFilters: [],
  setSearchFilters: () => {},
  elementByPage: 6,
  setElementByPage: () => {},
  maxPage: 1,
  setMaxPage: () => {},
  curPage: 1,
  setCurPage: () => {},
  loading: false,
  setLoading: () => {}
});

export const SearchJobProvider = ({ children }: { children: ReactNode }) => {
  const [jobs, setJobs] = useState<CreateJob[]>([]);
  const [jobs1, setJobs1] = useState<CreateJob1[]>([]);
  const [totalResult, setTotalResult] = useState(0);
  const [searchFilters, setSearchFilters] = useState<string[]>([]);
  const [elementByPage, setElementByPage] = useState(6);
  const [maxPage, setMaxPage] = useState(1);
  const [curPage, setCurPage] = useState(1);
  const [loading, setLoading] = useState(true);

  return (
    <SearchJobContext.Provider
      value={{
        jobs,
        jobs1,
        totalResult,
        searchFilters,
        elementByPage,
        maxPage,
        curPage,
        loading,
        setJobs,
        setJobs1,
        setTotalResult,
        setSearchFilters,
        setElementByPage,
        setMaxPage,
        setCurPage,
        setLoading
      }}
    >
      {children}
    </SearchJobContext.Provider>
  );
};

export const useSearchJob = (elementToDisplay?: number, searchTerm?: string) => {
  const {
    jobs1,
    jobs,
    totalResult,
    searchFilters,
    elementByPage,
    maxPage,
    curPage,
    loading,
    setJobs1,
    setJobs,
    setTotalResult,
    setSearchFilters,
    setElementByPage,
    setMaxPage,
    setCurPage,
    setLoading
  } = useContext(SearchJobContext);
  const { user } = useCurrentUser();
  const { type } = useLanding();
  const { api, activeAccount, activeSigner } = useInkathon()
  const [fetchIsLoading, setFetchIsLoading] = useState<boolean>();
  const { contract, address: contractAddress } = useRegisteredContract(ContractIds.Polkalance)
  const [searchJobsResult, setSearchJobsResult] = useState<any[]>([]);

  useEffect(() => {
    if (elementToDisplay) {
      setElementByPage(elementToDisplay);
      // handleSearch(1, elementToDisplay, searchFilters);
    }
  }, [elementToDisplay, setElementByPage, searchTerm]);

  const callGet = useCallback(
    async (page: number, limit: number, searchTerm?: string) => {
      setLoading(true);
      let res = null;
      // res = await searchJobs({ page, limit, searchTerm });
      // if (res) {
      //   setCurPage(page);
      //   setJobs([...res.jobs]);
      //   setMaxPage(res.maxPage);
      //   setTotalResult(res.totalResult);
      // }
      setLoading(false);
    },
    [setCurPage, setJobs1, setLoading, setMaxPage, setTotalResult, user]
  );

  const searchJobs2 = async (page: number, elementByPage: number, filters: string[]) => {
    if (!contract || !api) return;
    setFetchIsLoading(true);
    setElementByPage(page);
    try {
      console.log(`searchQuery :::: ${filters}`);
      console.log(`categoryQuery :::: ${filters}`);
      const result = await contractQuery(api, '', contract, 'get_all_open_jobs', {}, [filters[0], filters[0]]);
      const { output, isError, decodedOutput } = decodeOutput(result, contract, 'get_all_open_jobs');
      if (isError) throw new Error(decodedOutput);
      setSearchJobsResult(output);
      const json = JSON.stringify(searchJobsResult, null, 2);
      console.log(`RESULT JSON String :::: ${json}`);
      const list_jobs = JSON.parse(json);
      const data = list_jobs.Ok;
      console.log(`DATA :::: ${data}`);
      if(data) {
        const _jobs= data as CreateJob[];
      console.log(`JOBS :::: ${_jobs}`);
      setLoading(true);
      let res = null;
      res =  {jobs: _jobs, maxPage: 1, totalResult: 1 };
      if (res) {
        setCurPage(1);
        setJobs([...res.jobs]);
        setMaxPage(res.maxPage);
        setTotalResult(res.totalResult);
      }
      }
    } catch (e) {
      console.error(e);
      toast.error('Error while fetching get all open jobs. Try again...');
      setSearchJobsResult([]);
      setLoading(false);
    } finally {
      setFetchIsLoading(false);
    }
  };

  const handleSearch = useCallback(
    (page: number, elementByPage: number, filters: string[]) => {
      if (filters.length === 0) {
        callGet(page, elementByPage);
      }
      if (filters.length === 1) {
        callGet(page, elementByPage, filters[0]);
      }
      if (filters.length > 1) {
        callGet(page, elementByPage, filters.join(';'));
      }
    },
    [callGet]
  );

  return {
    jobs1,
    jobs,
    loading,
    maxPage,
    curPage,
    totalResult,
    searchFilters,
    setElementByPage,
    elementByPage,
    setSearchFilters,
    handleSearch,
    searchJobs2
  };
};
