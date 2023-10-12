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
    switchActiveChain,
    connect,
    disconnect,
    isConnecting,
    isConnected,
    activeAccount,
    accounts,
    api,
    setActiveAccount
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
    let exist = true;
    if (!contract || !api || !activeAccount) return false;
    setFetchIsLoading(true);
    try {
      const result = await contractQuery(api, activeAccount?.address, contract, 'check_exist_wallet');
      const { output, isError, decodedOutput } = decodeOutput(result, contract, 'check_exist_wallet');
      if (isError) throw new Error(decodedOutput);
      if(output === "undifined") {
        setActiveAccountUser(false);
        setType(UserTypeEnum.Guest);
      } else {
        if (output === "freelancer") {
          setType(UserTypeEnum.Freelancer);
        } else {
          setType(UserTypeEnum.Company);
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
          currentUserType: type,
          tosAcceptedOn: "",
          wallet: ""
        });
        setUser(res);
        setActiveAccountUser(true);
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
        // alert("ADDRESS :::: "+`0x${activeAccount.address}`);
        // alert("NETWORK :::: "+`${activeChain.network}`);
        //login({ address: `0x${activeAccount.address}`, chain: `${activeChain.network}` });
        checkExistWallet();
      }
    }
  }, [activeAccount, activeChain, isConnected, login, signupModalOpen, user]);

  return { isLoading };
};
