import { signUpWithAlepZeroApi } from '@services/auth';
import { useCallback } from 'react';

interface SigupProps {
  address: `${string}`;
  chain: `${string}`;
  email: string;
  firstname: string;
  lastname: string;
  currentUserType: string;
  agreeTOS: boolean;
  agreeDataTreatment: boolean;
}

export function useSignUp() {
  // const signUp = useCallback(
  //   async ({
  //     address,
  //     email,
  //     firstname,
  //     lastname,
  //     currentUserType,
  //     agreeTOS,
  //     agreeDataTreatment
  //   }: SigupProps): Promise<boolean | string> => {
  //     if (address) {
  //       try {
  //         return address;
  //       } catch (error: any) {
  //         return error.response.data.message;
  //       }
  //     }
  //     return 'Please link your wallet';
  //   },
  //   []
  // );

  const signUp = useCallback(
    async ({
      address,
      chain,
      email,
      firstname,
      lastname,
      currentUserType,
      agreeTOS,
      agreeDataTreatment
    }: SigupProps): Promise<boolean | string> => {
      if (address && chain) {
        try {
          const nonce = null;
          const message = "";
          const signature = message;
          const res = await signUpWithAlepZeroApi({
            message,
            signature,
            wallet: address,
            email,
            firstname,
            lastname,
            currentUserType,
            agreeTOS,
            agreeDataTreatment
          });
          return res;
        } catch (error: any) {
          return error.response.data.message;
        }
      }
      return 'Please link your wallet';
    },
    []
  );

  return { signUp };
}
