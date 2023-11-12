import { FC, useState, useEffect } from 'react'
import { Formik, Form, Field, ErrorMessage, FieldProps } from 'formik'
import * as Yup from 'yup'
import {
  Button,
  Checkbox,
  Text,
  FormControl,
  FormLabel,
  Input,
  Flex,
  useToast,
  FormHelperText,
  Box,
  SimpleGrid, 
  Spinner
} from '@chakra-ui/react'
import {
  SubstrateChain,
  SubstrateWalletPlatform,
  allSubstrateWallets,
  contractTx, //thêm vào
  getSubstrateChain,
  isWalletInstalled,
  useBalance,
  useInkathon,
  useRegisteredContract,
  contractQuery,
  decodeOutput,
} from '@scio-labs/use-inkathon'
import { encodeAddress } from '@polkadot/util-crypto'
import { ConnectButton } from '../web3/ConnectButton'
import RadioCard from '../radio/RadioCard'
import RadioCardGroup from '../radio/RadioCardGroup'
import { shortHash, UserTypeEnum, CreateJob } from '../../utility/src'
import { useSignUp } from '../hooks/useSignUp'
//thêm vào 
import { ContractIds } from '../../deployments/deployments'
import { useLanding, useJobs} from '@front-provider/src'
import { useRouter } from 'next/router'
import JobCard2 from '@components/card/JobCard2'


// interface RadioUserType {
//   label: string
//   value: string
// }

// const RadioGroupUserType: RadioUserType[] = [
//   {
//     label: 'Freelancer',
//     value: UserTypeEnum.Freelancer,
//   },
//   {
//     label: 'Employer',
//     value: UserTypeEnum.Company,
//   },
// ]

interface FormData {
  rules: string,
  percent_paid_when_contract_fail: number,
  duration: number,
  deposit: number,
}

const validationSchema = Yup.object().shape({
  rules: Yup.string().min(2).required('Rules required'),
  percent_paid_when_contract_fail: Yup.number()
    .transform((value, originalValue) => parseInt(originalValue))
    .moreThan(0)
    .required('Percent paid when cotract fail is required'),
  duration: Yup.number()
    .transform((value, originalValue) => parseInt(originalValue))
    .moreThan(0)
    .required('Duration is required'),
  deposit: Yup.number()
    .transform((value, originalValue) => parseInt(originalValue))
    .moreThan(0)
    .required('Deposit is required'),
})


// interface AuctionFormProps {
//   onSubmitSuccess: () => void
// }

const CreateJobContractForm: FC = () => {
//   const {
//     activeAccount
//   } = useInkathon()
  const toast = useToast()

//   // thêm vào
  const [loading, setLoading] = useState(false)
  const { api, activeSigner, activeAccount} = useInkathon()
  const { contract, address: contractAddress } = useRegisteredContract(ContractIds.Polkalance)
  const { push } = useRouter()
  //////////////////////
  const { jobs, jobsFetching, setJobsFetching, setJobs} = useJobs()
  const { setAuctionModalOpen, setJobIdForForm, submitModalOpen, useFormDone, jobIdForForm, accountForForm, setUseFormDone} = useLanding();
  const [allAuctioneer, setAllAuctioneer] = useState<Auctioneer[]>([]);

  const auctionJob = async (values: FormData) => {
     
    if (!activeAccount || !contract || !activeSigner || !api) {
      return false
    }
    console.log(jobIdForForm);
    try {
      await contractTx(api, activeAccount.address, contract, 'createContract', {value: values.deposit}, [
        jobIdForForm, accountForForm, values.rules, values.percent_paid_when_contract_fail, values.duration
      ])
      toast({
        title: <Text mt={-0.5}>Create contract successfully</Text>,
        status: 'success',
        isClosable: true,
        position: 'top-right',
      })
      // onSubmitSuccess();
    } catch (e: any) {
      const error = e.errorMessage;
      toast({
        title: <Text mt={-0.5}>{error}</Text>,
        status: 'error',
        isClosable: true,
        position: 'top-right',
      })
    }finally{
      setUseFormDone(true)
    }
  }


  const onSubmit = async (values: FormData) => {
    if (activeAccount?.address && !loading) {
      setLoading(true)
      auctionJob(values)
      console.log(jobIdForForm, accountForForm)
      setLoading(false)
    }
  }
  interface Auctioneer {
    0: string;
    1: string;
    2: string;
  }
  
  // const searchAllAuctioneer = async () => {
  //   if (!contract || !api || !activeAccount) return null;
  //   setJobsFetching(true);
  //   try {
  //     const result = await contractQuery(api, activeAccount.address ,contract, 'get_all_auctioneer', {}, [jobIdForForm]);
  //     const { output, isError, decodedOutput } = decodeOutput(result, contract, 'get_all_auctioneer');
  //     const json = JSON.stringify(output, null, 2);
  //     const list_auctioneer = JSON.parse(json);
  //     const data = list_auctioneer.Ok;
  //     const allAuctioneer = data as Auctioneer[];
  //     setAllAuctioneer(allAuctioneer)
  //     // console.log(allAuctioneer)
  //     if (isError) throw new Error(decodedOutput);
  //   } catch (e) {
  //     console.log(e);
  //     setAllAuctioneer([])
  //   } finally {
  //     setJobsFetching(false);
  //   }
  // };

  // useEffect(() => {
  //   searchAllAuctioneer();  
  //   // if (useFormDone) {
  //   //   setUseFormDone(false)
  //   // }
  // }, [contract, api, useFormDone]);

  interface AuctioneersProps {
    auctioneer: Auctioneer;
    blurred?: boolean;
    onClick?: () => void;
  }

const AuctioneersCard: FC<AuctioneersProps> = ({ auctioneer, blurred = false, onClick }: AuctioneersProps) => {
  return (
    <Box
      p={6}
      borderColor="neutral.gray"
      borderWidth="1px"
      borderRadius="32px"
      bgColor="white"
      cursor="pointer"
      position="relative"
      onClick={onClick}
    >
      <Text
            fontFamily="Comfortaa"
            fontWeight="700"
            fontSize="14px"
            lineHeight="120%"
            color="neutral.black"
          >
            {
              // // console.log(auctioneer?.freelancer);
              // <h1>Ta chia hao</h1>
              <>
                <h1>Freelancer: {auctioneer[0]}</h1>
                <h1>Desired Salary: {auctioneer[1]}</h1>
                <h1>Required Deposit Of Company: {auctioneer[1]}</h1>
              </>
            }
      </Text>
    </Box>
  )
}


  return (
    <Formik
      initialValues={{
        rules: '',
        percent_paid_when_contract_fail: 0,
        duration: 0,
        deposit: 0,
      }}
      validationSchema={validationSchema}
      isInitialValid={false}
      onSubmit={onSubmit}
      validateOnChange={false}
      validateOnBlur={true}
    >
      {({ isValid, errors, touched }) => (
        <Form>
          <FormControl id="rules" isRequired mb={6}>
            <FormLabel>Rules</FormLabel>
            <Field
              name="rules"
              placeholder="Enter rules of contract"
              as={Input}
              type="rules"
              isInvalid={errors.rules && touched.rules}
            />
            <ErrorMessage name="rules">
              {(msg) => <Text textStyle="errorMessage">{msg}</Text>}
            </ErrorMessage>
          </FormControl>
          <FormControl id="percent_paid_when_contract_fail" isRequired mb={6}>
            <FormLabel>Percent paid when contract fail</FormLabel>
            <Field
              name="percent_paid_when_contract_fail"
              placeholder="Enter percent paid when contract fail"
              as={Input}
              type="percent_paid_when_contract_fail"
              isInvalid={errors.rules && touched.rules}
            />
            <ErrorMessage name="percent_paid_when_contract_fail">
              {(msg) => <Text textStyle="errorMessage">{msg}</Text>}
            </ErrorMessage>
          </FormControl>
          <FormControl id="duration" isRequired mb={6}>
            <FormLabel>Duration</FormLabel>
            <Field
              name="duration"
              placeholder="Enter duration"
              as={Input}
              type="duration"
              isInvalid={errors.rules && touched.rules}
            />
            <ErrorMessage name="duration">
              {(msg) => <Text textStyle="errorMessage">{msg}</Text>}
            </ErrorMessage>
          </FormControl>
          <FormControl id="deposit" isRequired mb={6}>
            <FormLabel>Deposit</FormLabel>
            <Field
              name="deposit"
              placeholder="Enter deposit"
              as={Input}
              type="deposit"
              isInvalid={errors.rules && touched.rules}
            />
            <ErrorMessage name="deposit">
              {(msg) => <Text textStyle="errorMessage">{msg}</Text>}
            </ErrorMessage>
          </FormControl>
          <Button
            variant={!isValid || !activeAccount?.address ? 'outline' : 'primary'}
            type="submit"
            width="100%"
            height={'40px'}
            backgroundColor={'#fdb81e'}
            textColor={'#002c39'}
            fontFamily={'Comfortaa'}
            fontSize={'1rem'}
            fontWeight={'700'}
            lineHeight={'133%'}
            isDisabled={!activeAccount}
            isLoading={loading}
            loadingText="Waiting for wallet signature"
            spinnerPlacement="end"
          >
            Create Contract
          </Button>
        </Form>
      )
      }
    </Formik>
    // <Flex flexDir="column">
    //   {allAuctioneer && allAuctioneer?.length > 0 && (
    //     <SimpleGrid columns={{ base: 1, lg: 1 }} spacing={8} w="100%">
    //        {
    //           allAuctioneer?.map((j, k) => (
    //             <AuctioneersCard auctioneer={j} key={k} onClick={()=>{setAuctionModalOpen(true)}}/>
    //           ))
    //        }
    //     </SimpleGrid>
    //   )}
    //   {/* {!jobsFetching && (
    //     <>
    //       {jobs && jobs?.length > 0 && (
    //         <SimpleGrid columns={{ base: 1, lg: 1 }} spacing={8} w="100%">
    //           {jobs?.map((j, k) => (
    //             <JobCard2 job={j} key={k} onClick={() => {
    //               // setSubmitDone(true)
    //               setCreateContractModalOpen(true);
    //               setJobIdForForm(parseInt(j.jobId));
    //             }} />              
    //           ))}
    //         </SimpleGrid>
    //       )}
    //       {!jobs ||
    //         (jobs.length === 0 && (
    //           <Box
    //             textStyle="body2"
    //             as="span"
    //             textAlign="center"
    //             position="absolute"
    //             top="50%"
    //             left="50%"
    //             transform="translate(-50%, -50%)"
    //           >
    //             No jobs available 
    //           </Box>
    //         ))}
    //     </>
    //   )}
    //   {jobsFetching && (
    //     <Flex
    //       flexDir="column"
    //       justifyContent="center"
    //       alignItems="center"
    //       my={16}
    //       position="absolute"
    //       top="50%"
    //       left="50%"
    //       transform="translate(-50%;-50%)"
    //     >
    //       <Spinner color="brand.primary" size="xl" mx="auto" />
    //       <Box
    //         textStyle="h6"
    //         as="span"
    //         color="#002c39"
    //         font-family={'Comfortaa'}
    //         font-size={'16px'}
    //         font-weight={'700'}
    //         line-height={'120%'}
    //         mt={8}
    //       >
    //         Loading Jobs
    //       </Box>
    //     </Flex>
    //   )} */}
    // </Flex>
  )
}

export default CreateJobContractForm
