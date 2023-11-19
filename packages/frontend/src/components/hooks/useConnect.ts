import { useCallback, useContext } from 'react';
import { useRouter } from 'next/router';
import { User } from '../../utility/src';
import Cookies from 'js-cookie';
import { CurrentUserContext, useLanding } from '@front-provider/src';

interface LoginProps {
  address: `0x${string}`;
  chain: `${string}`;
}

function getUser(user: User) {
  return user;
}

export function useConnect() {
  const { pathname, push } = useRouter();
  const { setUser } = useContext(CurrentUserContext);
  const { setActiveAccountUser } = useLanding();

  const signIn = useCallback(
    async ({ address, chain }: LoginProps) => {
      if (address && chain && pathname === '/') {
        try {
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

  const signOut = useCallback(
    async () => {
      push('/');
      Cookies.remove('authenticated');
      setUser(null);
      setActiveAccountUser(false);
    }, []
  );

  return { signIn, signOut };
}
