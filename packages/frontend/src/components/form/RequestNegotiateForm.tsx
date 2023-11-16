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
  feedback: string,
  negotiationPay: number,
}

const validationSchema = Yup.object().shape({
  feedback: Yup.string().min(2).required('Feedback required'),
  negotiationPay: Yup.number()
    .transform((value, originalValue) => parseInt(originalValue))
    .moreThan(0)
    .required('Negotiation pay is required'),
})

interface RequestNegotiateFormProps {
  onSubmitSuccess: () => void
}

const RequestNegotiateForm: FC<RequestNegotiateFormProps> = ({ onSubmitSuccess }) => {
  const {
    activeAccount
  } = useInkathon()
  const toast = useToast()
  const {jobIdForForm, setUseFormDone} = useLanding();

  // thêm vào
  const [loading, setLoading] = useState(false)
  const { api, activeSigner } = useInkathon()
  const { contract, address: contractAddress } = useRegisteredContract(ContractIds.Polkalance)
  const { push } = useRouter()
  const requestNegotiate = async (values: FormData) => {
        
    if (!activeAccount || !contract || !activeSigner || !api) {
      return false
    }
    
    try {
      await contractTx(api, activeAccount.address, contract, 'request_negotiate', {}, [
        jobIdForForm, values.feedback, values.negotiationPay
      ])
      toast({
        title: <Text mt={-0.5}>Request successfully</Text>,
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


  const onSubmit = async (values: FormData) => {
    if (activeAccount?.address && !loading) {
      setLoading(true)
      requestNegotiate(values)
      setLoading(false)
    }
  }
  return (
    <Formik
      initialValues={{
        feedback: '',
        negotiationPay: 0,
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
          <FormControl id="feedback" isRequired mb={6}>
            <FormLabel>Your Feeback</FormLabel>
            <Field
              name="feedback"
              placeholder="Enter your feedback"
              as={Input}
              type="feedback"
              isInvalid={errors.feedback && touched.feedback}
            />
            <ErrorMessage name="feedback">
              {(msg) => <Text textStyle="errorMessage">{msg}</Text>}
            </ErrorMessage>
          </FormControl>
          <FormControl id="negotiationPay" isRequired mb={6}>
            <FormLabel>Your negotiation pay</FormLabel>
            <Field
              name="negotiationPay"
              placeholder="Enter your negotiation pay"
              as={Input}
              type="negotiationPay"
              isInvalid={errors.negotiationPay && touched.negotiationPay}
            />
            <ErrorMessage name="negotiationPay">
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
                    Do you want to request negotiation?
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
            Request negotiate
          </Button>
        </Form>
      )}
    </Formik>
  )
}

export default RequestNegotiateForm
