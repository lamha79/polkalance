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

interface SigninFormProps {
  onSubmitSuccess: () => void
}

const SigninForm: FC<SigninFormProps> = ({ onSubmitSuccess }) => {
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
      // updateRegister(values)
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
      )}
    </Formik>
  )
}

export default SigninForm
