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
import { encodeAddress } from '@polkadot/util-crypto'
import { ConnectButton } from '../web3/ConnectButton'
import RadioCard from '../radio/RadioCard'
import RadioCardGroup from '../radio/RadioCardGroup'
import { shortHash, UserTypeEnum } from '../../utility/src'
import { useSignUp } from '../hooks/useSignUp'
//thêm vào 
import { ContractIds } from '../../deployments/deployments'
import { useLanding } from '@front-provider/src'
import { useRouter } from 'next/router'


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
  desired_salary: number,
  required_deposit_of_owner: number,
}

const validationSchema = Yup.object().shape({
  desired_salary: Yup.number()
    .transform((value, originalValue) => parseInt(originalValue))
    .moreThan(0)
    .required('Desired salary is required'),
  required_deposit_of_owner: Yup.number()
    .transform((value, originalValue) => parseInt(originalValue))
    .moreThan(0)
    .required('Deposit of owner is required'),
})

interface AuctionFormProps {
  onSubmitSuccess: () => void
}

const AuctionForm: FC<AuctionFormProps> = ({ onSubmitSuccess }) => {
  const {
    activeAccount
  } = useInkathon()
  const toast = useToast()
  const {jobSubmitId, setUseFormDone} = useLanding();

  // thêm vào
  const [loading, setLoading] = useState(false)
  const { api, activeSigner } = useInkathon()
  const { contract, address: contractAddress } = useRegisteredContract(ContractIds.Polkalance)
  const { push } = useRouter()
  const auctionJob = async (values: FormData) => {
     
    if (!activeAccount || !contract || !activeSigner || !api) {
      return false
    }
    console.log(jobSubmitId);
    try {
      await contractTx(api, activeAccount.address, contract, 'jobAuction', {}, [
        jobSubmitId, values.desired_salary, values.required_deposit_of_owner
      ])
      toast({
        title: <Text mt={-0.5}>Auction successfully</Text>,
        status: 'success',
        isClosable: true,
        position: 'top-right',
      })
      onSubmitSuccess();
    } catch (e: any) {
      let error = e.errorMessage;
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
      setLoading(false)
    }
  }
  return (
    <Formik
      initialValues={{
        agreeTOS: false,
        desired_salary: 0,
        required_deposit_of_owner: 0,
      }}
      validationSchema={validationSchema}
      isInitialValid={false}
      onSubmit={onSubmit}
      validateOnChange={false}
      validateOnBlur={true}
    >
      {({ isValid, errors, touched }) => (
        <Form>
          <FormControl id="desired_salary" isRequired mb={6}>
            <FormLabel>Your desired salary</FormLabel>
            <Field
              name="desired_salary"
              placeholder="Enter your desired salary"
              as={Input}
              type="desired_salary"
              isInvalid={errors.desired_salary && touched.desired_salary}
            />
            <ErrorMessage name="desired_salary">
              {(msg) => <Text textStyle="errorMessage">{msg}</Text>}
            </ErrorMessage>
          </FormControl>
          <FormControl id="required_deposit_of_owner" isRequired mb={6}>
            <FormLabel>Required deposit of company</FormLabel>
            <Field
              name="required_deposit_of_owner"
              placeholder="Enter required deposit of company"
              as={Input}
              type="required_deposit_of_owner"
              isInvalid={errors.required_deposit_of_owner && touched.required_deposit_of_owner}
            />
            <ErrorMessage name="required_deposit_of_owner">
              {(msg) => <Text textStyle="errorMessage">{msg}</Text>}
            </ErrorMessage>
          </FormControl>
          <Flex flexDirection="column" mb={4}>
            <FormControl id="agreeTOS" isRequired>
              <Field name="agreeTOS" type="checkbox">
                {({ field }: FieldProps<string>) => (
                  <Checkbox
                    {...field}
                    isChecked={field.checked}
                    isInvalid={errors.agreeTOS !== undefined && touched.agreeTOS}
                  >
                    Do you want auction this job?
                  </Checkbox>
                )}
              </Field>
            </FormControl>
            <ErrorMessage name="agreeTOS">
              {(msg) => <Text textStyle="errorMessage">{msg}</Text>}
            </ErrorMessage>
          </Flex>
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
            Auction job
          </Button>
        </Form>
      )}
    </Formik>
  )
}

export default AuctionForm
