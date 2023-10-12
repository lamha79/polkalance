import {
  SubstrateChain,
  SubstrateWalletPlatform,
  allSubstrateWallets,
  getSubstrateChain,
  isWalletInstalled,
  useBalance,
  useInkathon,
} from '@scio-labs/use-inkathon'
import { API_URL } from '../../front-provider/src/api';
import { SiweMessage } from 'siwe';
import { useCallback, useState } from 'react';
import { useRouter } from 'next/router';
import { User } from '../../utility/src';

interface LoginProps {
  address: `0x${string}`;
  chain: `${string}`;
}

function getUser(user: User) {
  return user;
}

export function useConnect() {
  const { pathname } = useRouter();

  const signIn = useCallback(
    async ({ address, chain }: LoginProps) => {
      if (address && chain && pathname === '/') {
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
