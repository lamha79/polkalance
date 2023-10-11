/* eslint-disable @typescript-eslint/no-empty-function */
import { useCurrentUser, useLanding } from '../../front-provider/src';
import { CreateJob, UserTypeEnum } from '../../utility/src';
import { searchFreelancers, searchFreelancersLogged, searchJobs, convertJsonToArray } from '../../services/search';
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
  jobs: CreateJob[];
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
  setJobs: () => {},
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
        totalResult,
        searchFilters,
        elementByPage,
        maxPage,
        curPage,
        loading,
        setJobs,
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
    jobs,
    totalResult,
    searchFilters,
    elementByPage,
    maxPage,
    curPage,
    loading,
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

  useEffect(() => {
    if (elementToDisplay) {
      setElementByPage(elementToDisplay);
      handleSearch(1, elementToDisplay, searchFilters);
    }
  }, [elementToDisplay, setElementByPage, searchTerm]);

  const searchJob = async (page: number, limit: number, searchTerm?: string) => {
    if (!contract || !api) return;
    setFetchIsLoading(true);
    try {
      const result = await contractQuery(api, '', contract, 'get_all_open_jobs', {}, [searchTerm, searchTerm]);
      const { output, isError, decodedOutput } = decodeOutput(result, contract, 'get_all_open_jobs');
      if (isError) throw new Error(decodedOutput);
      return convertJsonToArray(output);
    } catch (e) {
      console.error(e);
      toast.error('Error while fetching get all open jobs. Try again...');
    } finally {
      setFetchIsLoading(false);
    }
  };

  const callGet = useCallback(
    async (page: number, limit: number, searchTerm?: string) => {
      setLoading(true);
      let res = null;
      res = await searchJob(page, limit, searchTerm);
      if (res) {
        setCurPage(page);
        setJobs([...res.jobs]);
        setMaxPage(res.maxPage);
        setTotalResult(res.totalResult);
      }
      setLoading(false);
    },
    [setCurPage, setJobs, setLoading, setMaxPage, setTotalResult, user]
  );

  const handleSearch = useCallback(
    (page: number, elementByPage: number, filters: string[]) => {
      if (filters.length === 0) {
        callGet(page, elementByPage);
      }
      if (filters.length === 1) {
        // callGet(page, elementByPage, filters[0]);
      }
      if (filters.length > 1) {
        // callGet(page, elementByPage, filters.join(';'));
      }
    },
    [callGet]
  );

  return {
    jobs,
    loading,
    maxPage,
    curPage,
    totalResult,
    searchFilters,
    setElementByPage,
    elementByPage,
    setSearchFilters,
    handleSearch
  };
};
