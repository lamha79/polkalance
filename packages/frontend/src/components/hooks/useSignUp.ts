import {
  SubstrateChain,
  SubstrateWalletPlatform,
  allSubstrateWallets,
  getSubstrateChain,
  isWalletInstalled,
  useBalance,
  useInkathon,
} from '@scio-labs/use-inkathon'
import { useCallback } from 'react';

interface SigupProps {
  address: `0x${string}`;
  email: string;
  firstname: string;
  lastname: string;
  currentUserType: string;
  agreeTOS: boolean;
  agreeDataTreatment: boolean;
}

export function useSignUp() {
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

  const signUp = useCallback(
    async ({
      address,
      email,
      firstname,
      lastname,
      currentUserType,
      agreeTOS,
      agreeDataTreatment
    }: SigupProps): Promise<boolean | string> => {
      if (address) {
        try {
          
        } catch (error: any) {
          return error.response.data.message;
        }
      }
      return 'Please link your wallet';
    },
    [disconnect]
  );

  return { signUp };
}
