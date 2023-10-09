import { useToast, Text } from '@chakra-ui/react';
import {
  SubstrateChain,
  SubstrateWalletPlatform,
  allSubstrateWallets,
  getSubstrateChain,
  isWalletInstalled,
  useBalance,
  useInkathon,
} from '@scio-labs/use-inkathon'
import { CurrentUserContext, useLanding } from '../../front-provider/src';
import { useCallback, useContext, useEffect, useState } from 'react';
import { useConnect } from './useConnect';

export const useLogin = (signupModalOpen: boolean) => {
  const { user, setUser } = useContext(CurrentUserContext);
  const { signIn } = useConnect();
  const { setType } = useLanding();
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
    setActiveAccount,
  } = useInkathon()

  const login = useCallback(
    async ({ address, chain }: { address: `0x${string}`; chain: `0x${string}` }) => {
      setIsLoading(true);
      const res = await signIn({ address, chain });
      if (typeof res !== 'string' && res) {
        setUser(res);
        setType(res.currentUserType);
      } else {
        toast({
          title: <Text mt={-0.5}>Error while login</Text>,
          description: typeof res === 'string' ? res : null,
          status: 'error',
          isClosable: true,
          position: 'top-right'
        });
      }
      setIsLoading(false);
    },
    [setType, setUser, signIn, toast]
  );

  useEffect(() => {
    if (!signupModalOpen && !user) {
      if (isConnected && activeChain && activeAccount) {
        login({ address: `0x${!activeAccount?.address}`, chain: `0x${!activeChain?.network}` });
      }
    }
  }, [activeAccount, activeChain, isConnected, login, signupModalOpen, user]);

  return { isLoading };
};
