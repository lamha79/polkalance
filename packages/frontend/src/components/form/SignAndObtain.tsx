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
import { truncateHash } from '@/utils/truncateHash'



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

// interface FormData {
//   desired_salary: number,
//   required_deposit_of_owner: number,
// }

// const validationSchema = Yup.object().shape({
//   desired_salary: Yup.number()
//     .transform((value, originalValue) => parseInt(originalValue))
//     .moreThan(0)
//     .required('Desired salary is required'),
//   required_deposit_of_owner: Yup.number()
//     .transform((value, originalValue) => parseInt(originalValue))
//     .moreThan(0)
//     .required('Deposit of owner is required'),
// })

interface SignAndObtainProps {
  onSubmitSuccess: () => void
}

const SignAndObtainForm: FC<SignAndObtainProps> = ({ onSubmitSuccess }) => {
//   const {
//     activeAccount
//   } = useInkathon()
//   const toast = useToast()
//   const {jobIdForForm, setUseFormDone} = useLanding();

//   // thêm vào
//   const [loading, setLoading] = useState(false)
//   const { api, activeSigner } = useInkathon()
//   const { contract, address: contractAddress } = useRegisteredContract(ContractIds.Polkalance)
//   const { push } = useRouter()
//   const auctionJob = async (values: FormData) => {
     
//     if (!activeAccount || !contract || !activeSigner || !api) {
//       return false
//     }
//     console.log(jobIdForForm);
//     try {
//       await contractTx(api, activeAccount.address, contract, 'jobAuction', {}, [
//         jobIdForForm, values.desired_salary, values.required_deposit_of_owner
//       ])
//       toast({
//         title: <Text mt={-0.5}>Auction successfully</Text>,
//         status: 'success',
//         isClosable: true,
//         position: 'top-right',
//       })
//       onSubmitSuccess();
//     } catch (e: any) {
//       const error = e.errorMessage;
//       toast({
//         title: <Text mt={-0.5}>{error}</Text>,
//         status: 'error',
//         isClosable: true,
//         position: 'top-right',
//       })
//     }finally{
//       setUseFormDone(true)
//     }
//   }


//   const onSubmit = async (values: FormData) => {
//     if (activeAccount?.address && !loading) {
//       setLoading(true)
//       auctionJob(values)
//       setLoading(false)
//     }
//   }
  interface ContractInfo {
    jobId: number,
    partyA: string,
    partyAConsent: boolean,
    requiredDepositOfPartyA: string,
    partyB: string,
    partyBConsent: boolean,
    requiredDepositOfPartyB: string,
    rules: string,
    percentPaidWhenContractFail: number, 
    deadlineToSignContract: string,
  }
  //////////////////////
  const { jobs, jobsFetching, setJobsFetching, setJobs} = useJobs()
  const { setCreateJobContractModalOpen, setJobIdForForm, submitModalOpen, setUseFormDone, useFormDone, jobIdForForm, setAccountForForm, type} = useLanding();
  const [contractInfo, setContractInfo] = useState<ContractInfo>();
  const [requiredDepositOfFreelancer, setRequiredDepositOfFreelancer] = useState<string>('0');
  const {api, activeAccount, activeSigner} = useInkathon();
  const { contract, address: contractAddress } = useRegisteredContract(ContractIds.Polkalance)
  const toast = useToast()
  ///////
  const getDay = (date: string) => {
    const a = parseInt(date.replace(/,/g, ''));
    const newdate = new Date(a);
    return newdate.toLocaleString()
  }
  ///////
  const getContractInfo = async () => {
    if (!contract || !api || !activeAccount) return null;
    setJobsFetching(true);
    try {
      const result = await contractQuery(api, activeAccount.address ,contract, 'get_contract_info_of_job_id', {}, [jobIdForForm]);
      const { output, isError, decodedOutput } = decodeOutput(result, contract, 'get_contract_info_of_job_id');
      const json = JSON.stringify(output, null, 2);
      const list_auctioneer = JSON.parse(json);
      const data = list_auctioneer.Ok;
      const contract_info = data as ContractInfo;
      setContractInfo(contract_info)
      setRequiredDepositOfFreelancer(contract_info.requiredDepositOfPartyB);
      if (isError) throw new Error(decodedOutput);
    } catch (e) {
      console.log(e);
    } finally {
      setJobsFetching(false);
    }
  };
  ////
  const signAndObtainThisJob = async () => {
    if (!activeAccount || !contract || !activeSigner || !api) {
      return false
    }
    try {
      await contractTx(api, activeAccount.address, contract, 'sign_contract_and_obtain', {value: parseInt(requiredDepositOfFreelancer.replaceAll(',',''))}, [jobIdForForm])
      toast({
        title: <Text mt={-0.5}>Sign and obtain successfully</Text>,
        status: 'success',
        isClosable: true,
        position: 'top-right',
      })
      onSubmitSuccess();
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

  ////
  const cancelThisContract = async () => {
    if (!activeAccount || !contract || !activeSigner || !api) {
      return false
    }
    try {
      await contractTx(api, activeAccount.address, contract, 'cancel_contract', {}, [jobIdForForm])
      toast({
        title: <Text mt={-0.5}>Cancel this contract successfully</Text>,
        status: 'success',
        isClosable: true,
        position: 'top-right',
      })
      onSubmitSuccess();
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

  useEffect(() => {
    getContractInfo();  
    if (useFormDone) {
      setUseFormDone(false)
    }
  }, [contract, api, useFormDone]);

  interface ContractInfoProps {
    contractInfo: ContractInfo;
    blurred?: boolean;
    onClick?: () => void;
  }

const ContractInfoCard: FC<ContractInfoProps> = ({ contractInfo, blurred = false, onClick }: ContractInfoProps) => {
  
  return (
    <Box
      p={10}
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
        fontSize="16.5px"
        lineHeight="120%"
        color="neutral.black"
          >
            {
              <>
                {/* jobId: number,
                partyA: string,
                partyAConsent: boolean,
                partyB: string,
                partyBConsent: boolean,
                rules: string,
                percentPaidWhenContractFail: number, 
                deadlineToSignContract: number, */}
                <h1>Job Id: {contractInfo.jobId }</h1>
            <h1>Party A: {truncateHash(encodeAddress(contractInfo.partyA || "", 42), 10)}</h1>
                <h1>Required deposit of Party A: {parseInt(contractInfo.requiredDepositOfPartyA)} TZERO</h1>
            <h1>Party B: {truncateHash(encodeAddress(contractInfo.partyB || "", 42), 10)}</h1>
                <h1>Required deposit of Party B: {parseInt(contractInfo.requiredDepositOfPartyB)} TZERO</h1>
                <h1>Rules: {contractInfo.rules}</h1>
                <h1>Percent company pay freelancer when contract fail: {contractInfo.percentPaidWhenContractFail}%</h1>
                <h1>Deadline to sign contract: {getDay(contractInfo.deadlineToSignContract)}</h1> 
              </>
            }
      </Text>
    </Box>
  )
}


  return (
    // <Formik
    //   initialValues={{
    //     agreeTOS: false,
    //     desired_salary: 0,
    //     required_deposit_of_owner: 0,
    //   }}
    //   validationSchema={validationSchema}
    //   isInitialValid={false}
    //   onSubmit={onSubmit}
    //   validateOnChange={false}
    //   validateOnBlur={true}
    // >
    //   {({ isValid, errors, touched }) => (
    //     <Form>
    //       <FormControl id="desired_salary" isRequired mb={6}>
    //         <FormLabel>Your desired salary</FormLabel>
    //         <Field
    //           name="desired_salary"
    //           placeholder="Enter your desired salary"
    //           as={Input}
    //           type="desired_salary"
    //           isInvalid={errors.desired_salary && touched.desired_salary}
    //         />
    //         <ErrorMessage name="desired_salary">
    //           {(msg) => <Text textStyle="errorMessage">{msg}</Text>}
    //         </ErrorMessage>
    //       </FormControl>
    //       <FormControl id="required_deposit_of_owner" isRequired mb={6}>
    //         <FormLabel>Required deposit of company</FormLabel>
    //         <Field
    //           name="required_deposit_of_owner"
    //           placeholder="Enter required deposit of company"
    //           as={Input}
    //           type="required_deposit_of_owner"
    //           isInvalid={errors.required_deposit_of_owner && touched.required_deposit_of_owner}
    //         />
    //         <ErrorMessage name="required_deposit_of_owner">
    //           {(msg) => <Text textStyle="errorMessage">{msg}</Text>}
    //         </ErrorMessage>
    //       </FormControl>
    //       <Flex flexDirection="column" mb={4}>
    //         <FormControl id="agreeTOS" isRequired>
    //           <Field name="agreeTOS" type="checkbox">
    //             {({ field }: FieldProps<string>) => (
    //               <Checkbox
    //                 {...field}
    //                 isChecked={field.checked}
    //                 isInvalid={errors.agreeTOS !== undefined && touched.agreeTOS}
    //               >
    //                 Do you want auction this job?
    //               </Checkbox>
    //             )}
    //           </Field>
    //         </FormControl>
    //         <ErrorMessage name="agreeTOS">
    //           {(msg) => <Text textStyle="errorMessage">{msg}</Text>}
    //         </ErrorMessage>
    //       </Flex>
    //       <FormControl mb={4}>
    //         {!activeAccount && (
    //           <Box fontWeight="600" textAlign="center" px={6} py={2.5} cursor="default">
    //             <ConnectButton />
    //           </Box>
    //         )}
    //         {activeAccount && (
    //           <Box
    //             borderWidth="1px"
    //             borderColor="green.300"
    //             color="green.300"
    //             borderRadius="32px"
    //             fontWeight="600"
    //             textAlign="center"
    //             px={6}
    //             py={2.5}
    //             cursor="default"
    //           >
    //             Connected with{' '}
    //             {shortHash(activeAccount.address, { padLeft: 6, padRight: 6, separator: '...' })}
    //           </Box>
    //         )}
    //         <FormHelperText>
    //           Once connected, you can change address with your wallet provider *
    //         </FormHelperText>
    //       </FormControl>
    //       <Button
    //         variant={!isValid || !activeAccount?.address ? 'outline' : 'primary'}
    //         type="submit"
    //         width="100%"
    //         height={'40px'}
    //         backgroundColor={'#fdb81e'}
    //         textColor={'#002c39'}
    //         fontFamily={'Comfortaa'}
    //         fontSize={'1rem'}
    //         fontWeight={'700'}
    //         lineHeight={'133%'}
    //         isDisabled={!activeAccount}
    //         isLoading={loading}
    //         loadingText="Waiting for wallet signature"
    //         spinnerPlacement="end"
    //       >
    //         Auction job
    //       </Button>
    //     </Form>
    //   )}
    // </Formik>
    <Flex flexDir="column">
      {contractInfo && contractInfo!=null && (
        <SimpleGrid columns={{ base: 1, lg: 1 }} spacing={8} w="100%">
           {
                <ContractInfoCard contractInfo={contractInfo} onClick={()=>{
                  // setCreateJobContractModalOpen(true);
                  // setAccountForForm(j[0]);
                }}/>
              
           }
        </SimpleGrid>
      )}
      { type === UserTypeEnum.Freelancer &&
        <Button
        // variant={!isValid || !activeAccount?.address ? 'outline' : 'primary'}
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
        // isLoading={loading}
        loadingText="Waiting for wallet signature"
        spinnerPlacement="end"
        onClick={() => signAndObtainThisJob()}
      >
        Sign and Obtain This Job
      </Button>
      }

      { type === UserTypeEnum.Company &&
        <Button
        // variant={!isValid || !activeAccount?.address ? 'outline' : 'primary'}
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
        // isLoading={loading}
        loadingText="Waiting for wallet signature"
        spinnerPlacement="end"
        onClick={() => cancelThisContract()}
      >
        Cancel This Contract
      </Button>
      }

      {/* {!jobsFetching && (
        <>
          {jobs && jobs?.length > 0 && (
            <SimpleGrid columns={{ base: 1, lg: 1 }} spacing={8} w="100%">
              {jobs?.map((j, k) => (
                <JobCard2 job={j} key={k} onClick={() => {
                  // setSubmitDone(true)
                  setCreateContractModalOpen(true);
                  setJobIdForForm(parseInt(j.jobId));
                }} />              
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
      )} */}
    </Flex>
  )
}

export default SignAndObtainForm
