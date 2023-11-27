import { FC, useState, useEffect } from 'react'
import { Formik, Form, Field, ErrorMessage, FieldProps } from 'formik'
import * as Yup from 'yup'
import {
  Text,
  Flex,
  Box,
  SimpleGrid,
} from '@chakra-ui/react'
import {
  useInkathon,
  useRegisteredContract,
  contractQuery,
  decodeOutput,
} from '@scio-labs/use-inkathon'

import { ContractIds } from '../../deployments/deployments'
import { useLanding, useJobs} from '@front-provider/src'


const HistoryForm: FC = () => {
  interface JobInfo {
    name: string;
    jobId: string;
    category: string;
    status: string;
    description: string;
  }
  //////////////////////
  const { jobs, jobsFetching, setJobsFetching, setJobs} = useJobs()
  const { useFormDone, accountForForm, setAccountForForm, historyModalOpen} = useLanding();
  const [allJobInfo, setAllJobInfo] = useState<JobInfo[]>([]);
  const {api, activeAccount} = useInkathon();
  const { contract, address: contractAddress } = useRegisteredContract(ContractIds.Polkalance)
  const searchHistoryJob = async () => {
    if (!contract || !api || !activeAccount) return null;
    setJobsFetching(true);
    try {
      const result = await contractQuery(api, activeAccount.address ,contract, 'get_all_jobs_of_person_with_status', {}, [accountForForm, 'auctioning,becreatingcontract,doing,review,unqualified,finish,canceled']);
      const { output, isError, decodedOutput } = decodeOutput(result, contract, 'get_all_jobs_of_person_with_status');
      const json = JSON.stringify(output, null, 2);
      const list_auctioneer = JSON.parse(json);
      const data = list_auctioneer.Ok;
      const allJobInfo = data as JobInfo[];
      setAllJobInfo(allJobInfo)
      // console.log(allAuctioneer)
      if (isError) throw new Error(decodedOutput);
    } catch (e) {
      console.log(e);
      setAllJobInfo([])
    } finally {
      setJobsFetching(false);
    }
  };

  useEffect(() => {
    searchHistoryJob();  
  }, [contract, api, useFormDone, historyModalOpen]);

  interface JobInfoProps {
    jobInfo: JobInfo;
    blurred?: boolean;
  }

const JobInfoCard: FC<JobInfoProps> = ({ jobInfo, blurred = false }: JobInfoProps) => {
  return (
    <Box
      p={10}
      borderColor="neutral.gray"
      borderWidth="1px"
      borderRadius="32px"
      bgColor="white"
      cursor="pointer"
      position="relative"
    >
      <Text
            fontFamily="Comfortaa"
            fontWeight="700"
            fontSize="12px"
            lineHeight="120%"
            color="neutral.black"
          >
            {
              <>
                <h1>Name: {jobInfo.name}</h1>
                <h1>Id: {jobInfo.jobId}</h1>
                <h1>Category: {jobInfo.category}</h1>
                <h1>Status: {jobInfo.status}</h1>
                <h1>Decription: {jobInfo.description}</h1>
              </>
            }
      </Text>
    </Box>
  )
}


  return (
    <Flex flexDir="column">
      {allJobInfo && allJobInfo?.length > 0 && (
        <SimpleGrid columns={{ base: 1, lg: 1 }} spacing={8} w="100%">
           {
              allJobInfo?.map((j, k) => (
                <JobInfoCard jobInfo={j} key={k} />
              ))
           }
        </SimpleGrid>
      )}
    </Flex>
  )
}

export default HistoryForm
