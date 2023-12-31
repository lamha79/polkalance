import { Box, Flex, SimpleGrid, Spinner, useToast, Text } from '@chakra-ui/react'
import { useJobs, useLanding } from '../../../../front-provider/src'
import JobCard2 from '../../../../components/card/JobCard2'
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
  const { jobs, jobsFetching, setJobsFetching, setJobs } = useJobs()
  const { push } = useRouter()
  const toast = useToast()
  const { setUseFormDone, useFormDone, setCreateContractModalOpen } = useLanding()
  //////
  const { api, activeSigner, activeAccount, isConnected, activeChain } = useInkathon()
  // const [fetchIsLoading, setFetchIsLoading] = useState<boolean>(false);
  // const [fetchSearchJob, setFetchSearchJob] = useState<boolean>(false);
  const [isCancelledDone, setIsCancelledDone] = useState<boolean>(false);
  const { contract, address: contractAddress } = useRegisteredContract(ContractIds.Polkalance)
  //////
  const cancelJob = async (job_id: number) => {

    if (!activeAccount || !contract || !activeSigner || !api) {
      return
    }
    try {
      await contractTx(api, activeAccount.address, contract, 'cancel', {}, [
        job_id
      ])
      toast({
        title: <Text mt={-0.5}>Cancel successfully</Text>,
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
      setIsCancelledDone(true)
    }
  };

  // const rejectJob = async (job_id: number) => {

  //   if (!activeAccount || !contract || !activeSigner || !api) {
  //     return
  //   }
  //   try {
  //     await contractTx(api, activeAccount.address, contract, 'reject', {}, [
  //       job_id
  //     ])
  //     toast({
  //       title: <Text mt={-0.5}>Reject success</Text>,
  //       status: 'success',
  //       isClosable: true,
  //       position: 'top-right',
  //     })
  //   } catch (e: any) {
  //     let error = e.errorMessage;
  //     toast({
  //       title: <Text mt={-0.5}>{error}</Text>,
  //       status: 'error',
  //       isClosable: true,
  //       position: 'top-right',
  //     })
  //   }
  //   finally {
  //     setIsRejectDone(true)
  //   }
  // };
  //////
  const searchJobs = async () => {
    if (!contract || !api || !activeAccount) return null;
    // setFetchIsLoading(true);
    setJobsFetching(true);
    try {
      const result = await contractQuery(api, activeAccount.address, contract, 'get_all_jobs_of_owner_with_status', {}, ['open']);
      const { output, isError, decodedOutput } = decodeOutput(result, contract, 'get_all_jobs_of_owner_with_status');
      if (isError) throw new Error(decodedOutput);
      const json = JSON.stringify(output, null, 2);
      const list_jobs = JSON.parse(json);
      const data = list_jobs.Ok;
      const jobs = data as CreateJob[];
      setJobs(jobs)
    } catch (e) {
      setJobs([])
    } finally {
      // setFetchIsLoading(false);
      // setFetchSearchJob(true);
      setJobsFetching(false);
    }
  };
  useEffect(() => {
    searchJobs();
    if (useFormDone) {
      setUseFormDone(false)
    }
    if (isCancelledDone) {
      setIsCancelledDone(false)
    }
  }, [contract, api, useFormDone, activeAccount, activeSigner, isCancelledDone]);
  //////
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
                  onClick={() => { cancelJob(parseInt(j.jobId.replaceAll(',',''))) }}
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
