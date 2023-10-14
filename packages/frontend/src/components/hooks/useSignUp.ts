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
          return address;
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
