import { Container } from '@chakra-ui/react';
import { useCurrentCompany, useCurrentUser, useJobs, useLanding } from '../front-provider/src';
import Cookies from 'js-cookie';
import { FC, PropsWithChildren, useCallback, useEffect, useState } from 'react';
import Header from './header/Header';
import SignupModal from './modal/SignupModal';
import { useRouter } from 'next/router';
import { getMyCompanies } from '../services/company';
import { getMyJobs } from '../services/jobs';
import CreateJobModal from './modal/CreateJobModal';
import { User, UserTypeEnum } from '../utility/src';

export const GlobalLayout: FC<PropsWithChildren> = ({ children }: PropsWithChildren) => {
  const { user, setUser, setFetchingUser } = useCurrentUser();
  const { setCompany, setFetching, fetching } = useCurrentCompany();
  const { setJobs, setJobsFetching, jobsFetching } = useJobs();
  const { type, setActiveAccountUser } = useLanding();
  const [isFetching, setIsFetching] = useState(false);
  const authenticatedCookie = Cookies.get('authenticated');
  const { pathname, push } = useRouter();

  function getUser(user: User) {
    return user;
  }

  const isUserLogged = useCallback(async () => {
    if (!isFetching) {
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

      if(res) {
        if (!user) {
          setUser(res);
          if(type !== UserTypeEnum.Guest) {
            setActiveAccountUser(true);
          }
        }
      }
      setIsFetching(false);
    }
  }, [setUser, user]);

  useEffect(() => {
    if (authenticatedCookie === 'true' && !user) {
      setIsFetching(true);
      setFetchingUser(true);
      if(type !== UserTypeEnum.Guest) {
        setActiveAccountUser(true);
      }
      isUserLogged();
    }

    if (!authenticatedCookie) {
      if (pathname !== '/') {
        push('/');
      }
      setFetchingUser(false);
      setIsFetching(false);
    }
  }, [isUserLogged, user, authenticatedCookie, pathname, push, setFetchingUser]);

  const getCompany = useCallback(async () => {
    // const res = await getMyCompanies();
    // setCompany(res);
    // setFetching(false);
  }, [setCompany, setFetching]);

  const getJobs = useCallback(async () => {
    // const res = await getMyJobs();
    // setJobs(res);
    // setJobsFetching(false);
  }, [setJobs, setJobsFetching]);

  useEffect(() => {
    if (user) {
      if (!fetching) {
        setFetching(true);
        // getCompany();
      }
    }
  }, [getCompany, setFetching, user]);

  useEffect(() => {
    if (!jobsFetching && user) {
      setJobsFetching(true);
      //getJobs();
    }
  }, [getJobs, setJobsFetching, user]);

  return (
    <Container
      maxW="100vw"
      minW="100vw"
      minH="100vh"
      w="100vw"
      h="100vh"
      p="0"
      display="flex"
      flexDir="column"
      overflow="hidden"
      position="relative"
      bgColor="neutral.lightGray"
      color="neutral.black"
    >
      {!user && !isFetching && <SignupModal />}
      {!user && !isFetching && <CreateJobModal />}
      <Header />
      {children}
    </Container>
  );
};

export default GlobalLayout;
