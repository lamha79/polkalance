import { FC, useEffect, useRef, useContext } from 'react';
import {
  Badge,
  Box,
  Button,
  Flex,
  FlexProps,
  Input,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  SimpleGrid,
  useDisclosure
} from '@chakra-ui/react';
import { FaCode } from 'react-icons/fa';
import Head from 'next/head';
import { JSXElementConstructor, Key, PromiseLikeOfReactNode, ReactElement, ReactNode, ReactPortal, useState } from 'react';
import Layout from '@/components/layout';
import toast from 'react-hot-toast'
import {
  contractQuery,
  decodeOutput,
  useInkathon,
  useRegisteredContract,
} from '@scio-labs/use-inkathon'
import { ContractIds } from '@/deployments/deployments'
import { Option } from '@polkadot/types';
import { border } from '@chakra-ui/react';

import { useLanding } from '../front-provider/src'
import { mostCommonSkill, UserTypeEnum } from '../utility/src'
import { useColoredBadges } from '../components/hooks/useColoredBadges';
import { useSearchFreelancer } from '../components/hooks/useSearchFreelancer';
import { useSearchJob, SearchJobContext } from '../components/hooks/useSearchJob';
import { convertJsonToArray } from '../services/search';
import { CreateJob, User, Job } from '../utility/src';
import JobCard2 from '@components/card/JobCard2';
import { useResponsive } from '@components/hooks/useResponsive';

const SearchJobPage : FC<FlexProps> = ({ ...props }: FlexProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryQuery, setCategoryQuery] = useState('');
  const { api, activeAccount, activeSigner } = useInkathon()
  const [fetchIsLoading, setFetchIsLoading] = useState<boolean>();
  const { contract, address: contractAddress } = useRegisteredContract(ContractIds.Polkalance)
  const [searchJobsResult, setSearchJobsResult] = useState<any[]>([]);
  const [title, setTitle] = useState<string>('');
  const menuRef = useRef(null);
  const inputRef = useRef(null);
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { getCategoryColorForSkill, allSkills } = useColoredBadges();
  const [filters, setFilters] = useState<string[]>([])
  const { type } = useLanding();
  const [curFilters, setCurFilters] = useState<string[]>([]);
  const searchFreelancer = useSearchFreelancer();
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

  const { mobileDisplay, tabletDisplay } = useResponsive();

  const blurredAt = mobileDisplay || tabletDisplay ? 7 : 6


  const handleItemClick = (filter: string) => {
    if (filter != 'No result') {
      setSearchText('');
      setSearchResults([]);
      if (!filters.includes(filter)) {
        setFilters([...filters, filter]);
      }
      selectFilter(filter); 
    }
    if (isOpen) onClose();
    if (inputRef.current) (inputRef.current as HTMLInputElement).focus();
  };

  const selectFilter = (filter: string) => {
    let newFilters: string[] = [];
    if (!curFilters.includes(filter)) {
      newFilters = [...curFilters, filter];
      setCurFilters(newFilters);
    } else {
      newFilters = [...curFilters.filter((v) => v !== filter)];
      setCurFilters(newFilters);
    }
    console.log(`FILTER :::: ${filter}`);
      searchJobs("it", "it");
    // if (type === UserTypeEnum.Company) {
    //   searchFreelancer.setSearchFilters(newFilters);
    // }
    // if (type === UserTypeEnum.Freelancer || type === UserTypeEnum.Guest) {
    //   // searchJobs.setSearchFilters(newFilters);
    // }

  };

  const searchJobs = async (searchQuery: string, categoryQuery: string) => {
    if (!contract || !api) return;
    setFetchIsLoading(true);
    setElementByPage(1);
    try {
      const result = await contractQuery(api, '', contract, 'get_all_open_jobs', {}, [searchQuery, categoryQuery]);
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

  // const json = JSON.stringify(searchJobsResult, null, 2);
  // const list_jobs = JSON.parse(json);
  // const data = list_jobs.Ok;
  // console.log(data);

  const searchSkills = (searchText: string) => {
    searchText = searchText.toLowerCase();
    if (searchText === '') {
      setSearchResults([]);
      onClose();
      return;
    }
    let searchResults = allSkills
      .filter((skill) => skill.toLowerCase().startsWith(searchText))
      .map((skill) => {
        let score = 0;
        if (skill.toLowerCase() === searchText) {
          score = 100;
        } else {
          score = 100 - skill.length;
        }
        return {
          skill,
          score
        };
      });

    searchResults.sort((a, b) => b.score - a.score);
    searchResults = searchResults.slice(0, 10);

    const finalResult = searchResults
      .map((result) => result.skill)
      .filter((result) => !filters.includes(result));
    if (finalResult.length > 0) {
      setSearchResults(finalResult);
    } else {
      setSearchResults(['No result']);
    }
    if (!isOpen) onOpen();
    if (inputRef.current) (inputRef.current as HTMLInputElement).focus();
  };

  useEffect(() => {
    if (type === UserTypeEnum.Freelancer || type === UserTypeEnum.Guest) {
      setTitle('Find the perfect offer');
      setCurFilters([]);
      setFilters([]);
    }

    if (type === UserTypeEnum.Company) {
      setTitle('Find the perfect freelancer');
      setCurFilters([]);
      setFilters(mostCommonSkill);
    }
  }, [type]);


  return (
    <Flex flexDir="column" {...props} zIndex="10">
      <Box textStyle="h2" cursor="default">
        {title}
      </Box>
      <Box position="relative">
        <Input
          ref={inputRef}
          variant="searchBar"
          mt={2}
          value={searchText}
          placeholder="Add a filter to improve your research"
          onChange={(e) => {
            setSearchText(e.target.value);
            searchSkills(e.target.value);
          }}
        />
        <Box ref={menuRef}>
          <Menu isOpen={isOpen}>
            <MenuButton as={Box} position="absolute" top="85%" left="0" zIndex={1} width="100%" />
            <MenuList>
              {searchResults?.map((result, index) => (
                <MenuItem key={index} onClick={(e) => handleItemClick((e.target as HTMLMenuElement).textContent || '')}>
                  {result}
                </MenuItem>
              ))}
            </MenuList>
          </Menu>
        </Box>
      </Box>
      {(filters && filters.length > 0) && (
        <Flex width="100%" mt={3} alignItems="center">
        <Flex maxW="85%" flexWrap="wrap" gap={2}>
          {filters.map((v, k) => {
            const colors = getCategoryColorForSkill(v)
            return (
              <Badge
                key={k}
                color={!curFilters.includes(v) ? 'neutral.black' : colors.color}
                bgColor={!curFilters.includes(v) ? 'none' : colors.bgColor}
                borderWidth="1px"
                borderColor={!curFilters.includes(v) ? colors.bgColor : 'none'}
                _hover={{
                  bgColor: !curFilters.includes(v) ? colors.bgColor : 'rgba(0,0,0,0)',
                  color: !curFilters.includes(v) ? colors.color : 'neutral.black',
                  borderColor: !curFilters.includes(v) ? 'none' : colors.bgColor,
                }}
                variant="filter"
                onClick={() => selectFilter(v)}
              >
                {v}
              </Badge>
            )
          })}
        </Flex>
        {filters.length > 0 && (
          <Button
            variant="link"
            size="xs"
            ml={4}
            mt={0.5}
            onClick={() => {
              setCurFilters([])
              setFilters([])
              setJobs([])
              setSearchResults(['No result']);
              if (type === UserTypeEnum.Company) {
                // searchFreelancer.setSearchFilters([])
              }
              if (type === UserTypeEnum.Freelancer) {
                // searchJobs.setSearchFilters([])
              }
            }}
          >
            Clear filters
          </Button>
        )}
      </Flex>
      )}
      
      {jobs && (
        <SimpleGrid
        columns={{ base: 1, lg: 2 }}
        spacing={8}
        w="100%"
        position="relative"
        zIndex="1"
        pb={16}
        {...props}
      >
        {jobs.map((v, k) => <JobCard2 key={k} job={v} blurred={k >= blurredAt} />)}
        {jobs.map((v, k) => (
            <JobCard2
              key={k}
              job={v}
              blurred={
                mobileDisplay || tabletDisplay
                  ? k >= jobs.length - 1
                  : jobs.length % 2 === 0
                  ? k >= jobs.length - 2
                  : k >= jobs.length - 1
              }
            />
          ))}
      </SimpleGrid>
      )
      }
    </Flex>
    // <section className="py-10">
    //     <div className="bg-white rounded-lg shadow p-6 mx-auto max-w-3xl">
    //       <h1 className="text-3xl text-gray-800 font-bold mb-6">
    //         <FaCode className="inline-block align-middle text-blue-500 mr-2" /> Find Jobs
    //       </h1>
    //       <form onSubmit={handleSearch} className="flex items-center">
    //         <input
    //           type="text"
    //           className="border border-gray-300 rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring focus:border-blue-500 flex-grow"
    //           placeholder="Enter job keyword"
    //           value={searchQuery}
    //           onChange={(e) => setSearchQuery(e.target.value)}
    //         />
    //         <input
    //           type="text"
    //           className="border border-gray-300 rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring focus:border-blue-500 flex-grow"
    //           placeholder="Enter job category"
    //           value={categoryQuery}
    //           onChange={(e) => setCategoryQuery(e.target.value)}
    //         />

    //         <button
    //           onClick={(e) => searchJobs(searchQuery, categoryQuery)}
    //           type="submit"
    //           className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded ml-4 focus:outline-none focus:ring focus:border-blue-300"
    //         >
    //           Search
    //         </button>
    //       </form>

    //       {fetchIsLoading && <p>Loading...</p>}

    //       {data && data.length > 0 ? (
    //         <table style={{ textAlign: 'center', border: '1px solid black' }}>
    //           <thead>
    //             <tr>
    //               <th>Job Name</th>
    //               <th>Description</th>
    //               <th>Category</th>
    //               <th>Pay</th>
    //               <th>End Time</th>
    //               <th>Status</th>
    //             </tr>
    //           </thead>

    //           <tbody>
    //             {data.map((item: { id: string, name: string, description: string, category: string, pay: string, endTime: string, status: string, personCreate: string }) => (
    //               <tr key={item.id}>
    //                 <td>{item.name}</td>
    //                 <td>{item.description}</td>
    //                 <td>{item.category}</td>
    //                 <td>{item.pay}</td>
    //                 <td>{item.endTime}</td>
    //                 <td>{item.status}</td>
    //                 <button
    //                   className="bg-gray-300 hover:bg-gray-700 text-black font-bold py-2 px-2 rounded focus:outline-none focus:shadow-outline"
    //                   style={{ margin: '10px', fontSize: '11px' }}
    //                 >
    //                   Obtain
    //                 </button>
    //               </tr>
    //             ))}
    //           </tbody>
    //         </table>
    //       ) : (
    //         <p>No data available.</p>
    //       )}

    //     </div>
    //   </section>
  );
}

export default SearchJobPage;