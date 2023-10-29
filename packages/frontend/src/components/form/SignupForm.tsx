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
import { ConnectButton } from '../../components/web3/ConnectButton'
import RadioCard from '../radio/RadioCard'
import RadioCardGroup from '../radio/RadioCardGroup'
import { shortHash, UserTypeEnum } from '../../utility/src'
import { useSignUp } from '../hooks/useSignUp'
//thêm vào 
import { ContractIds } from '../../deployments/deployments'


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
    label: 'Company',
    value: UserTypeEnum.Company,
  },
]

interface FormData {
  email: string
  firstname: string
  lastname: string
  currentUserType: string
  agreeTOS: boolean
  agreeDataTreatment: boolean
}

const validationSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Email is required'),
  firstname: Yup.string().min(2).required('Firstname required'),
  lastname: Yup.string().min(2).required('Lastname required'),
  currentUserType: Yup.string()
    .oneOf(Object.values(UserTypeEnum), 'Invalid user type')
    .required('User type is required'),
  agreeTOS: Yup.bool().oneOf([true], 'Must agree to Terms of Service'),
  agreeDataTreatment: Yup.bool().oneOf([true], 'Must agree to data treatment policy'),
})

interface SignupFormProps {
  onSubmitSuccess: () => void
}

const SignupForm: FC<SignupFormProps> = ({ onSubmitSuccess }) => {
  const {
    activeAccount
  } = useInkathon()
  const toast = useToast()

  // thêm vào
  const [loading, setLoading] = useState(false)
  const { api, activeSigner } = useInkathon()
  const { contract, address: contractAddress } = useRegisteredContract(ContractIds.Polkalance)
  const updateRegister = async (values: FormData) => {
        
    if (!activeAccount || !contract || !activeSigner || !api) {
      return false
    }
    
    try {
      await contractTx(api, activeAccount.address, contract, 'register', {}, [
        values.firstname + ' ' + values.lastname, values.email, values.currentUserType
      ])
      toast({
        title: <Text mt={-0.5}>Account registered Successfully</Text>,
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
        email: '',
        firstname: '',
        lastname: '',
        currentUserType: RadioGroupUserType[0].value,
        agreeTOS: false,
        agreeDataTreatment: false,
      }}
      validationSchema={validationSchema}
      isInitialValid={false}
      onSubmit={onSubmit}
      validateOnChange={false}
      validateOnBlur={true}
    >
      {({ isValid, errors, touched }) => (
        <Form>
          <FormControl id="email" isRequired mb={6}>
            <FormLabel>Your mail</FormLabel>
            <Field
              name="email"
              placeholder="Enter your mail"
              as={Input}
              type="email"
              isInvalid={errors.email && touched.email}
            />
            <ErrorMessage name="email">
              {(msg) => <Text textStyle="errorMessage">{msg}</Text>}
            </ErrorMessage>
          </FormControl>
          <FormControl id="firstname" isRequired mb={6}>
            <FormLabel>Your firstname</FormLabel>
            <Field
              name="firstname"
              placeholder="Enter your firstname"
              as={Input}
              type="text"
              isInvalid={errors.firstname && touched.firstname}
            />
            <ErrorMessage name="firstname">
              {(msg) => (
                <Text mt={1} textStyle="errorMessage">
                  {msg}
                </Text>
              )}
            </ErrorMessage>
          </FormControl>
          <FormControl id="lastname" isRequired mb={6}>
            <FormLabel>Your lastname</FormLabel>
            <Field
              name="lastname"
              placeholder="Enter your lastname"
              as={Input}
              type="text"
              isInvalid={errors.lastname && touched.lastname}
            />
            <ErrorMessage name="lastname">
              {(msg) => <Text textStyle="errorMessage">{msg}</Text>}
            </ErrorMessage>
          </FormControl>
          <FormControl id="currentUserType" mb={6}>
            <FormLabel>Your are a</FormLabel>
            <RadioCardGroup name="currentUserType" display="flex" columnGap={2}>
              {RadioGroupUserType.map((v, k) => {
                return (
                  <RadioCard key={k} groupName="currentUserType" label={v.label} value={v.value} />
                )
              })}
            </RadioCardGroup>
            <FormHelperText>You’ll be able to switch at any moment *</FormHelperText>
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
                    I agree to the Terms of Service
                  </Checkbox>
                )}
              </Field>
            </FormControl>
            <ErrorMessage name="agreeTOS">
              {(msg) => <Text textStyle="errorMessage">{msg}</Text>}
            </ErrorMessage>
          </Flex>
          <Flex flexDirection="column" mb={6}>
            <FormControl id="agreeDataTreatment" isRequired>
              <Field name="agreeDataTreatment" type="checkbox">
                {({ field }: FieldProps<string>) => (
                  <Checkbox
                    {...field}
                    isChecked={field.checked}
                    isInvalid={
                      errors.agreeDataTreatment !== undefined && touched.agreeDataTreatment
                    }
                  >
                    I agree to the data treatment policy
                  </Checkbox>
                )}
              </Field>
            </FormControl>
            <ErrorMessage name="agreeDataTreatment">
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
