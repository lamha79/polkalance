import { useCurrentCompany, useJobs } from '../../front-provider/src';
import { CreateJob } from '../../utility/src';
import { useCallback, useState } from 'react';
import {
  SubstrateChain,
  SubstrateWalletPlatform,
  allSubstrateWallets,
  getSubstrateChain,
  isWalletInstalled,
  useBalance,
  useInkathon,
} from '@scio-labs/use-inkathon'

interface CreateJobProps {
  address: `0x${string}`;
  email: string;
  firstname: string;
  lastname: string;
  currentUserType: string;
  agreeTOS: boolean;
  agreeDataTreatment: boolean;
}

export function useCreateJob() {
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

  const createJob = useCallback(
    async ({
      address,
      email,
      firstname,
      lastname,
      currentUserType,
      agreeTOS,
      agreeDataTreatment
    }: CreateJobProps): Promise<boolean | string> => {
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

  return { createJob };
}
