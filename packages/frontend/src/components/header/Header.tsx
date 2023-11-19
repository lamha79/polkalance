import { Box, Flex } from '@chakra-ui/react';
import { useCurrentUser, useLanding } from '../../front-provider/src/index';
import { FC } from 'react';
import BrandLogo from '../logo/BrandLogo';
import UserTypeSwitch from '../switch/UserTypeSwitch';
import HeaderButton from './HeaderButton';
import HeaderMenu from './HeaderMenu';
import { useResponsive } from '../hooks/useResponsive';
import HeaderMobile from './HeaderMobile';
import DashboardMenuContent from '../dashboard/menu/DashboardMenuContent';

const Header: FC = () => {
  const { user, fetchingUser } = useCurrentUser();
  const { hasScroll, activeAccountUser } = useLanding();
  const {desktopDisplay, mobileDisplay, tabletDisplay} = useResponsive();

  return (
    <Flex
      direction="row"
      px={{base: 2, lg: 8}}
      py={4}
      alignItems="center"
      justifyContent="space-between"
      position="fixed"
      zIndex="999"
      width="100%"
      bgColor="#edf2f7"
      transition="all ease-in-out 250ms"
      boxShadow={hasScroll ? 'xl' : 'none'}
    >
      {desktopDisplay && <>
        <Flex direction="row" alignItems="center">
          <BrandLogo />
          {!activeAccountUser && (<UserTypeSwitch ml={12} />)}
        </Flex>

        {(!user && !fetchingUser && !activeAccountUser)  && (
          <Flex direction="row" alignItems="center" justifyContent="center">
            <HeaderMenu />
          </Flex>
        )}
        {!fetchingUser && (
          <Flex direction="row" alignItems="center" justifyContent="end">
            <HeaderButton />
          </Flex>
        )}
      </>}
      
      {(mobileDisplay || tabletDisplay) && <>
        <Flex direction="row" alignItems="center" w="100%" position="relative">
          <HeaderMobile />
          <Box position="absolute" left="50%" top="50%" transform="translate(-50%, -50%)"><BrandLogo /></Box>
        </Flex>
      </>}
    </Flex>
  );
};

export default Header;
