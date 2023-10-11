import {
  SubstrateChain,
  SubstrateWalletPlatform,
  allSubstrateWallets,
  getSubstrateChain,
  isWalletInstalled,
  useBalance,
  contractQuery,
  decodeOutput,
  useInkathon,
  useRegisteredContract
} from '@scio-labs/use-inkathon'
import { API_URL } from '../../front-provider/src/api';
import { SiweMessage } from 'siwe';
import { useCallback, useState } from 'react';
import { useRouter } from 'next/router';
import { User } from '../../utility/src';
import { ContractIds } from '@/deployments/deployments';
import { boolean } from 'yup';
import toast from 'react-hot-toast';

interface LoginProps {
  address: `0x${string}`;
  chain: `${string}`;
}

function getUser(user: User) {
  return user;
}

export function useConnect() {
  const { pathname } = useRouter();
  const { api, activeAccount, activeSigner } = useInkathon()
  const [fetchIsLoading, setFetchIsLoading] = useState<boolean>();
  const { contract, address: contractAddress } = useRegisteredContract(ContractIds.Polkalance)

  const checkExistWallet = async (): Promise<boolean> => {
    boolean 
    if (!contract || !api) return false;
    setFetchIsLoading(true);
    try {
      const result = await contractQuery(api, '', contract, 'check_exist_wallet', {}, []);
      const { output, isError, decodedOutput } = decodeOutput(result, contract, 'check_exist_wallet');
      if (isError) throw new Error(decodedOutput);
      if(output === "undifined") {
        return false;
      }
    } catch (e) {
      console.error(e);
      toast.error('Error while fetching get all open jobs. Try again...');
    } finally {
      setFetchIsLoading(false);
    }

    return true;
  };

  const signIn = useCallback(
    async ({ address, chain }: LoginProps) => {
      const exist = await checkExistWallet();
      alert(`EXIST :::: ${exist}`);
      if (address && chain && exist && pathname === '/') {
        try {
          const signature = null;
          const message = null;
          const user = getUser({
            email: "",
            firstname: "",
            lastname: "",
            description: "",
            phone: "",
            language: [],
            location: "",
            profilePicture: "",
            links: [],
            createdAt: "",
            updatedAt: "",
            hasFreelanceProfile: "true",
            currentUserType: "Freelance",
            tosAcceptedOn: "",
            wallet: ""
          });
          return user;
        } catch (error: any) {
          if (error.response) {
            return error.response.data.message;
          }
          if (error.message) {
            return error.message;
          }
        }
      }
    },
    []
  );

  return { signIn };
}
