import { useToast, Text } from '@chakra-ui/react';
import {
  useInkathon,
  useRegisteredContract,
  contractQuery,
  decodeOutput
} from '@scio-labs/use-inkathon'
import { CurrentUserContext, useLanding } from '../../front-provider/src';
import { ContractIds } from '@/deployments/deployments';
import { useCallback, useContext, useEffect, useState } from 'react';
import { useConnect } from './useConnect';
import { User, UserTypeEnum } from '@utility/src';
import { useRouter } from 'next/navigation';

function getUser(user: User) {
  return user;
}

export const useLogin = (signupModalOpen: boolean) => {
  const { user, setUser } = useContext(CurrentUserContext);
  const { setType, type,  setActiveAccountUser, isCheckWallet, setIsCheckWallet } = useLanding();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const { push } = useRouter();
  const {
    activeChain,
    isConnected,
    activeAccount,
    api
  } = useInkathon()

  const [fetchIsLoading, setFetchIsLoading] = useState<boolean>();
  const { contract, address: contractAddress } = useRegisteredContract(ContractIds.Polkalance)

   const checkExistWallet = async () => {
    // alert("here")
    let exist = false;
    if (!contract || !api || !activeAccount) return exist;
    setFetchIsLoading(true);
    try {
      const result = await contractQuery(api, activeAccount?.address, contract, 'check_exist_wallet');
      const { output, isError, decodedOutput } = decodeOutput(result, contract, 'check_exist_wallet');
      if (isError) throw new Error(decodedOutput);
      let _type = output;
      if(output[1] === "undefined") {
        setActiveAccountUser(false);
        push('/');
        setType(UserTypeEnum.Guest);
        setUser(null);
      } else {
        if (output[1] === "freelancer") {
          setType(UserTypeEnum.Freelancer);
          _type = "Freelance";
        } else {
          setType(UserTypeEnum.Company);
          _type = "Teamlead";
        }
        const res = getUser({
          email: "",
          firstname: output[0],
          lastname: output[0],
          description: "",
          phone: "",
          language: [],
          location: "",
          profilePicture: "",
          links: [],
          createdAt: "",
          updatedAt: "",
          hasFreelanceProfile: "",
          currentUserType: _type,
          tosAcceptedOn: "",
          wallet: ""
        });
        setUser(res);
        setActiveAccountUser(true);
        exist = true;
      }
    } catch (e) {
      console.error(e);
      toast({
        title: <Text mt={-0.5}>Error while fetching get all open jobs. Try again...</Text>,
        description: null,
        status: 'error',
        isClosable: true,
        position: 'top-right'
      });
      exist = false;
    } finally {
      setFetchIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isCheckWallet) {
      if (isConnected && activeChain && activeAccount) {
        checkExistWallet();
      }
      setIsCheckWallet(true);
    }
  }, [activeAccount, activeChain, isConnected, signupModalOpen, user]);

  return { isLoading, checkExistWallet };
};
