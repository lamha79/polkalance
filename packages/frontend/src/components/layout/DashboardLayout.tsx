import { Flex, Spinner } from '@chakra-ui/react';
import { useCurrentUser, useLanding } from '../../front-provider/src';
import { NextPage } from 'next';
import DashboardMenu from '../dashboard/menu/DashboardMenu';
import { ReactNode, useEffect } from 'react';
import { UserTypeEnum } from '../../utility/src';
import { useResponsive } from '../hooks/useResponsive';
import CreateJobModal from '@components/modal/CreateJobModal';
import AuctionModal from '@components/modal/AuctionModal';
import CreateContractModal from '@components/modal/CreateContractModal';
import CreateJobContractModal from '@components/modal/CreateJobContractModal';
import SignAndObtainModal from '@components/modal/SignAndObtainModal';
import SubmitModal from '@components/modal/SubmitModal';
import RequestNegotiateModal from '@components/modal/RequestNegotiateModal';
import RespondNegotiateModal from '@components/modal/RespondNegotiateModal';
import HistoryModal from '@components/modal/HistoryModal';

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout: NextPage<DashboardLayoutProps> = ({ children }) => {
  const { user } = useCurrentUser();
  const { setType, type, activeAccountUser } = useLanding();
  const {mobileDisplay, tabletDisplay, desktopDisplay} = useResponsive();
  
  useEffect(() => {
    if (user) {
      if (type !== user.currentUserType) {
        setType(user.currentUserType as UserTypeEnum);
      }
    }
  }, [user]);

  return (
    <Flex flexDir="column" w="100%" mt="80px" h={`calc(100vh - 80px)`}>
      <Flex w="100%" h="100%" position="relative">
        {desktopDisplay && <DashboardMenu />}
        {(user && activeAccountUser && type === UserTypeEnum.Company) && <CreateJobModal />}
        {(user && activeAccountUser) && <SubmitModal />}
        {(user && activeAccountUser) && <AuctionModal />}
        {(user && activeAccountUser) && <CreateContractModal />}
        {(user && activeAccountUser) && <CreateJobContractModal />}
        {(user && activeAccountUser) && <SignAndObtainModal />}
        {(user && activeAccountUser) && <RequestNegotiateModal />}
        {(user && activeAccountUser) && <RespondNegotiateModal />}
        {(user && activeAccountUser) && <HistoryModal/>}

        {children}
        {!user && (
          <Flex w={{base: "100vw", lg: "calc(100vw - 245px)"}} ml="auto">
            <Flex px={{base: 0, lg: 6}} flexDir="column" w="100%" h="100%" minH="calc( 100vh - 80px )">
              <Flex
                flexDir="column"
                w="100%"
                flexGrow="1"
                bgColor="neutral.white"
                px={{base: 4, lg: 8}}
                py={{base: 2, lg: 6}}
                gap={{base: 4, lg: 8}}
                borderRadius="64px"
                justifyContent="center"
                alignItems="center"
              >
                <Spinner size="xl" color="brand.primary" />
              </Flex>
            </Flex>
          </Flex>
        )}
      </Flex>
    </Flex>
  );
};

export default DashboardLayout;
