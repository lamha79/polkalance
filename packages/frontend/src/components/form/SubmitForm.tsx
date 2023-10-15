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
  result: string
}

const validationSchema = Yup.object().shape({
  result: Yup.string().min(2).required('Result required'),
})

interface SignupFormProps {
  onSubmitSuccess: () => void
}

const SignupForm: FC<SignupFormProps> = ({ onSubmitSuccess }) => {
  const {
    activeAccount
  } = useInkathon()
  const toast = useToast()
  const {jobSubmitId} = useLanding();

  // thêm vào
  const [loading, setLoading] = useState(false)
  const { api, activeSigner } = useInkathon()
  const { contract, address: contractAddress } = useRegisteredContract(ContractIds.Polkalance)
  const { push } = useRouter()
  const updateRegister = async (values: FormData) => {
        
    if (!activeAccount || !contract || !activeSigner || !api) {
      return false
    }
    
    try {
      await contractTx(api, activeAccount.address, contract, 'submit', {}, [
        jobSubmitId,values.result
      ])
      toast({
        title: <Text mt={-0.5}>Submit successfully</Text>,
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
    }
  }


  const onSubmit = async (values: FormData) => {
    if (activeAccount?.address && !loading) {
      setLoading(true)
      updateRegister(values)
      setLoading(false)
    }
  }
  return (
    <Formik
      initialValues={{
        result: '',
        agreeTOS: false,
      }}
      validationSchema={validationSchema}
      isInitialValid={false}
      onSubmit={onSubmit}
      validateOnChange={false}
      validateOnBlur={true}
    >
      {({ isValid, errors, touched }) => (
        <Form>
          <FormControl id="reusult" isRequired mb={6}>
            <FormLabel>Your result</FormLabel>
            <Field
              name="result"
              placeholder="Enter your result"
              as={Input}
              type="result"
              isInvalid={errors.result && touched.result}
            />
            <ErrorMessage name="result">
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
                    Are your sure this result?
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
            Register
          </Button>
        </Form>
      )}
    </Formik>
  )
}

export default SignupForm
