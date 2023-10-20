import { Box, Flex, SimpleGrid, Spinner, useToast, Text } from '@chakra-ui/react'
import { useJobs } from '../../../../front-provider/src'
import JobCard2 from '../../../card/JobCard2'
import router, {useRouter } from 'next/router'
import { FC, useEffect, useState } from 'react'
import {
  contractQuery,
  contractTx,
  decodeOutput,
  useInkathon,
  useRegisteredContract,
} from '@scio-labs/use-inkathon'
import { ContractIds } from '@/deployments/deployments'
import { CreateJob, CreateJob1 } from '../../../../utility/src';
import { shallowCopy } from 'ethers/lib/utils'
const FreelancerGallery: FC = () => {
  const { jobs, jobsFetching, setJobsFetching, setJobs} = useJobs()
  const { push, replace, reload} = useRouter()
  const toast = useToast()
  //////
  const { api, activeSigner, activeAccount, isConnected, activeChain} = useInkathon()
  const [fetchIsLoading, setFetchIsLoading] = useState<boolean>();
  const [fetchObtain, setFetchObtain] = useState<boolean>(false);
  const { contract, address: contractAddress } = useRegisteredContract(ContractIds.Polkalance)
  /////////
  const obtainJob = async (job_id: number) => {
    if (!activeAccount || !contract || !activeSigner || !api) {
      return
    }
    try {
      await contractTx(api, activeAccount.address, contract, 'obtain', {}, [
        job_id
      ])
      toast({
        title: <Text mt={-0.5}>Obtain job successfully</Text>,
        status: 'success',
        isClosable: true,
        position: 'top-right',
      })
    } catch (e: any) {
      const error = e.errorMessage;
      toast({
        title: <Text mt={-0.5}>{error}</Text>,
        status: 'error',
        isClosable: true,
        position: 'top-right',
      })
    } 
    finally {
      setFetchObtain(true)
    }
  };
  /////////
  const searchJobs = async () => {
    setJobsFetching(false) //thêm vào
    setFetchIsLoading(true);
    if (!contract || !api || !activeAccount) return null;
    try {
      const result = await contractQuery(api, activeAccount.address ,contract, 'get_all_open_jobs_no_params', {}, []);
      const { output, isError, decodedOutput } = decodeOutput(result, contract, 'get_all_open_jobs_no_params');
      const json = JSON.stringify(output, null, 2);
      const list_jobs = JSON.parse(json);
      const data = list_jobs.Ok;
      // console.log(data[0].name);
      const jobs = data as CreateJob[];
      setJobs(jobs)
      if (isError) throw new Error(decodedOutput);
      // setSearchJobsResult(output);
    } catch (e) {
      console.error(e);
      return ([])
    } finally {
      setFetchIsLoading(false);
    }
  };
  useEffect(() => {
      searchJobs();
      if (fetchObtain){
        setFetchObtain(false) 
      }
  }, [contract, api, fetchObtain]);
  //////
  return (
    <Flex flexDir="column">
      {!jobsFetching && (
        <>
          {jobs && jobs?.length > 0 && (
            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8} w="100%">
              {jobs?.map((j, k) => (
                <JobCard2 job={j} key={k} onClick={() => obtainJob(parseInt(j.jobId))
                } />
              ))}
            </SimpleGrid>
          )}
          {!jobs ||
            (jobs.length === 0 && (
              <Box
                textStyle="body2"
                as="span"
                textAlign="center"
                position="absolute"
                top="50%"
                left="50%"
                transform="translate(-50%, -50%)"
              >
                No jobs available 
              </Box>
            ))}
        </>
      )}
      {jobsFetching && (
        <Flex
          flexDir="column"
          justifyContent="center"
          alignItems="center"
          my={16}
          position="absolute"
          top="50%"
          left="50%"
          transform="translate(-50%;-50%)"
        >
          <Spinner color="brand.primary" size="xl" mx="auto" />
          <Box
            textStyle="h6"
            as="span"
            color="#002c39"
            font-family={'Comfortaa'}
            font-size={'16px'}
            font-weight={'700'}
            line-height={'120%'}
            mt={8}
          >
            Loading Jobs
          </Box>
        </Flex>
      )}
    </Flex>
  )
}

export default FreelancerGallery
