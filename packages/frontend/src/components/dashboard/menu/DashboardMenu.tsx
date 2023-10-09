import { Avatar, Box, Button, Flex, Spinner, Text } from '@chakra-ui/react';
import { useCurrentCompany, useCurrentUser, useLanding } from '../../../../front-provider/src';
import { FC } from 'react';
import { UserTypeEnum } from '../../../../utility/src';
import { useRouter } from 'next/router';
import DashboardMenuContent from './DashboardMenuContent';



const DashboardMenu: FC = () => {

  return (
    <Flex
      flexDir="column"
      w="245px"
      h="100%"
      py={10}
      px={8}
      rowGap={6}
      position="fixed"
      zIndex="999"
    >
      <DashboardMenuContent />
    </Flex>
  );
};

export default DashboardMenu;
