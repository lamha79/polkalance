import { FC, useState } from 'react'
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
} from '@scio-labs/use-inkathon'
import { ConnectButton } from '../../components/web3/ConnectButton'
import { shortHash, UserTypeEnum } from '../../utility/src'
import { useCreateJob } from '../hooks/useCreateJob'
//thêm vào
import { ContractIds } from '../../deployments/deployments'
const DECIMAL_NUMBER = 1_000_000_000_000;  


interface RadioUserType {
  label: string
  value: string
}

const RadioGroupUserType: RadioUserType[] = [
  {
    label: 'Freelancer',
    value: UserTypeEnum.Freelancer,
  },
  {
    label: 'Employer',
    value: UserTypeEnum.Company,
  },
]

interface FormData {
  jobTitle: string
  description: string
  category: string
  budget: number
  duration: number
}

const validationSchema = Yup.object().shape({
  jobTitle: Yup.string().min(2).required('Job title is required'),
  description: Yup.string().min(2).required('Description required'),
  category: Yup.string().min(2).required('Category required'),
  budget: Yup.number()
    .transform((value, originalValue) => parseInt(originalValue))
    .moreThan(0)
    .required('Budget is required'),
  duration: Yup.number()
    .transform((value, originalValue) => parseInt(originalValue))
    .moreThan(0)
    .required('Duration is required'),
})

interface CreateJobFormProps {
  onSubmitSuccess: () => void
}

const CreateJobForm: FC<CreateJobFormProps> = ({ onSubmitSuccess }) => {
  const {
    activeChain,
    switchActiveChain,
    connect,
    disconnect,
    isConnecting,
    activeAccount,
    accounts,
    setActiveAccount,
  } = useInkathon()
  const { createJob } = useCreateJob()
  const toast = useToast()

  // thêm vào
  const [loading, setLoading] = useState(false)
  const { api, activeSigner } = useInkathon()
  const { contract, address: contractAddress } = useRegisteredContract(ContractIds.Freelankakot)
  const updateCreateJob = async (values: FormData) => {
    if (!activeAccount || !contract || !activeSigner || !api) {
      return
    }
    try {
      await contractTx(api, activeAccount.address, contract, 'create_job', {value: values.budget * DECIMAL_NUMBER}, [
        values.jobTitle,
        values.description,
        values.category,
        values.duration,
      ])

      toast({
        title: <Text mt={-0.5}>Create Job Successfully</Text>,
        status: 'success',
        isClosable: true,
        position: 'top-right',
      })
      onSubmitSuccess()
    } catch (e: any) {
      let error = e.errorMessage
      toast({
        title: <Text mt={-0.5}>{error}</Text>,
        status: 'error',
        isClosable: true,
        position: 'top-right',
      })
    }
  }

  const onSubmit = async (values: FormData) => {
    if (activeAccount?.address && !loading) {
      setLoading(true)
      updateCreateJob(values)
      setLoading(false)
    }
  }
  return (
    <Formik
      initialValues={{
        jobTitle: '',
        description: '',
        category: '',
        budget: 0,
        duration: 0,
      }}
      validationSchema={validationSchema}
      isInitialValid={false}
      onSubmit={onSubmit}
      validateOnChange={false}
      validateOnBlur={true}
    >
      {({ isValid, errors, touched }) => (
        <Form>
          <FormControl id="jobTitle" isRequired mb={6}>
            <FormLabel>Job title</FormLabel>
            <Field
              name="jobTitle"
              placeholder="Enter your job title"
              as={Input}
              type="jobTitle"
              isInvalid={errors.jobTitle && touched.jobTitle}
            />
            <ErrorMessage name="jobTitle">
              {(msg) => <Text textStyle="errorMessage">{msg}</Text>}
            </ErrorMessage>
          </FormControl>
          <FormControl id="description" isRequired mb={6}>
            <FormLabel>Description</FormLabel>
            <Field
              name="description"
              placeholder="Enter your description"
              as={Input}
              type="text"
              isInvalid={errors.description && touched.description}
            />
            <ErrorMessage name="description">
              {(msg) => (
                <Text mt={1} textStyle="errorMessage">
                  {msg}
                </Text>
              )}
            </ErrorMessage>
          </FormControl>
          <FormControl id="category" isRequired mb={6}>
            <FormLabel>Category</FormLabel>
            <Field
              name="category"
              placeholder="Category"
              as={Input}
              type="text"
              isInvalid={errors.category && touched.category}
            />
            <ErrorMessage name="category">
              {(msg) => <Text textStyle="errorMessage">{msg}</Text>}
            </ErrorMessage>
          </FormControl>
          <FormControl id="budget" mb={6}>
            <FormLabel>Budget</FormLabel>
            <Field
              name="budget"
              placeholder="Budget"
              as={Input}
              type="number"
              isInvalid={errors.budget && touched.budget}
            />
            <ErrorMessage name="budget">
              {(msg) => <Text textStyle="errorMessage">{msg}</Text>}
            </ErrorMessage>
          </FormControl>
          <FormControl id="duration" isRequired>
            <FormLabel>Duration</FormLabel>
            <Field
              name="duration"
              placeholder="Duration"
              as={Input}
              type="number"
              isInvalid={errors.duration && touched.duration}
            />
            <ErrorMessage name="duration">
              {(msg) => <Text textStyle="errorMessage">{msg}</Text>}
            </ErrorMessage>
          </FormControl>
          <FormControl mb={4}>
            {!activeAccount && (
              <Box fontWeight="600" textAlign="center" px={6} py={2.5} cursor="default">
                <ConnectButton />
              </Box>
            )}
            {activeAccount && (
              <Box
                borderWidth="1px"
                borderColor="green.300"
                color="green.300"
                borderRadius="32px"
                fontWeight="600"
                textAlign="center"
                px={6}
                py={2.5}
                cursor="default"
              >
                Connected with{' '}
                {shortHash(activeAccount.address, { padLeft: 6, padRight: 6, separator: '...' })}
              </Box>
            )}
            <FormHelperText>
              Once connected, you can change address with your wallet provider *
            </FormHelperText>
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
            Create Job
          </Button>
        </Form>
      )}
    </Formik>
  )
}

export default CreateJobForm
