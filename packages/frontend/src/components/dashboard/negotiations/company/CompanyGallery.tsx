import { Box, Flex, SimpleGrid, Spinner, useToast, Text } from '@chakra-ui/react'
import { useJobs, useLanding } from '../../../../front-provider/src'
import JobCard2 from '../../../card/JobCard2'
import { useRouter } from 'next/router'
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


const CompanyGallery: FC = () => {
  const { jobs, jobsFetching, setJobsFetching, setJobs} = useJobs()
  const { push } = useRouter()
  const toast = useToast()
  //////
  const { api, activeSigner, activeAccount, isConnected, activeChain} = useInkathon()
  const [fetchIsLoading, setFetchIsLoading] = useState<boolean>();
  const { contract, address: contractAddress } = useRegisteredContract(ContractIds.Polkalance)
  /////////
  const [terminateDone, setTerminateDone] = useState<boolean>(false);
  const terminate = async (job_id: number) => {
    if (!activeAccount || !contract || !activeSigner || !api) {
      return
    }
    try {
      await contractTx(api, activeAccount.address, contract, 'terminate', {}, [
        job_id
      ])
      toast({
        title: <Text mt={-0.5}>Terminate successfully</Text>,
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
    } finally {
      setTerminateDone(true);
    }
  };
  const {type, setRequestNegotiateModalOpen, setRespondNegotiateModalOpen, setJobIdForForm, jobIdForForm, useFormDone} = useLanding();
  const searchJobs = async () => {
    if (!contract || !api || !activeAccount) return null;
    setFetchIsLoading(true);
    try {
      const result = await contractQuery(api, activeAccount.address ,contract, 'get_all_jobs_of_owner_with_status', {}, ['unqualified']);
      const { output, isError, decodedOutput } = decodeOutput(result, contract, 'get_all_jobs_of_owner_with_status');
      const json = JSON.stringify(output, null, 2);
      const list_jobs = JSON.parse(json);
      const data = list_jobs.Ok;
      const jobs = data as CreateJob[];
      setJobs(jobs)
      if (isError) throw new Error(decodedOutput);
      // setSearchJobsResult(output);
    } catch (e) {
      // console.error(e);
      return ([])
      // toast.error('Error while fetching greeting. Try again...');
      // setSearchJobsResult([]);
    } finally {
      setJobsFetching(false);
    }
  };
  useEffect(() => {
    // setJobs([job]);
    // alert(isConnected);
    if (isConnected && activeChain && activeAccount) {
      searchJobs();
    }
    if (terminateDone) {
      setTerminateDone(false)
    }
  }, [contract, api, terminateDone, useFormDone, activeAccount]);
  ////A//
  return (
    <Flex flexDir="column">
      {!jobsFetching && (
        <>
          {jobs && jobs?.length > 0 && (
            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8} w="100%">
              {jobs?.map((j, k) => (
                <JobCard2 
                  job={j} 
                  key={k} 
                  onClick={() => {
                    // setSubmitDone(true)
                    setRequestNegotiateModalOpen(true);
                    setJobIdForForm(parseInt(j.jobId.replaceAll(',','')));
                  }} 
                  onClick1={() => {
                    // setSubmitDone(true)
                    setRespondNegotiateModalOpen(true);
                    setJobIdForForm(parseInt(j.jobId.replaceAll(',','')));
                  }} 
                  onClick2={() => {
                    setJobIdForForm(parseInt(j.jobId.replaceAll(',','')));
                    terminate(jobIdForForm);
                  }}
                />
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

export default CompanyGallery
