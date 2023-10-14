import { Avatar, Box, Button, Flex, Spinner, Text } from '@chakra-ui/react';
import { FC } from 'react';
import DashboardMenuContent from './DashboardMenuContent';
import CreateJobModal from '@components/modal/CreateJobModal';
import { useLanding } from '@front-provider/src';



const DashboardMenu: FC = () => {
  const { activeAccountUser } = useLanding();
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
