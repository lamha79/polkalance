import { useToast, Text } from '@chakra-ui/react';
import {
  SubstrateChain,
  SubstrateWalletPlatform,
  allSubstrateWallets,
  getSubstrateChain,
  isWalletInstalled,
  useBalance,
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

function getUser(user: User) {
  return user;
}

export const useLogin = (signupModalOpen: boolean) => {
  const { user, setUser } = useContext(CurrentUserContext);
  const { signIn } = useConnect();
  const { setType, type } = useLanding();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const {
    activeChain,
    isConnected,
    activeAccount,
    api
  } = useInkathon()

  const [fetchIsLoading, setFetchIsLoading] = useState<boolean>();
  const { contract, address: contractAddress } = useRegisteredContract(ContractIds.Polkalance)
  const { setActiveAccountUser } = useLanding()

  const login = useCallback(
    async ({ address, chain }: { address: `0x${string}`; chain: `${string}` }) => {
      setIsLoading(true);
      const res = await signIn({ address, chain });
      if (typeof res !== 'string' && res) {
        setUser(res);
        setType(res.currentUserType);
      } else {
        toast({
          title: <Text mt={-0.5}>Please Sign up</Text>,
          description: typeof res === 'string' ? res : null,
          status: 'info',
          isClosable: true,
          position: 'top-right'
        });
      }
      setIsLoading(false);
    },
    [setType, setUser, signIn, toast]
  );

   const checkExistWallet = async () => {
    let exist = false;
    if (!contract || !api || !activeAccount) return exist;
    setFetchIsLoading(true);
    try {
      const result = await contractQuery(api, activeAccount?.address, contract, 'check_exist_wallet');
      const { output, isError, decodedOutput } = decodeOutput(result, contract, 'check_exist_wallet');
      if (isError) throw new Error(decodedOutput);
      let _type = output;
      if(output === "undifined") {
        setActiveAccountUser(false);
        setType(UserTypeEnum.Guest);
      } else {
        if (output === "freelancer") {
          setType(UserTypeEnum.Freelancer);
          _type = "Freelance";
        } else {
          setType(UserTypeEnum.Company);
          _type = "Teamlead";
        }
        const res = getUser({
          email: "",
          firstname: "LAM",
          lastname: "HA",
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
    if (!signupModalOpen && !user) {
      if (isConnected && activeChain && activeAccount) {
        checkExistWallet();
      }
    }
  }, [activeAccount, activeChain, isConnected, login, signupModalOpen, user]);

  return { isLoading, checkExistWallet };
};
