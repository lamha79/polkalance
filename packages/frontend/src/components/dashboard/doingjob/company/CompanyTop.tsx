import { Box, Button, Flex } from '@chakra-ui/react';
import FileIcon from '../../../icons/FileIcon';
import { FC } from 'react';
import { useLanding } from '@front-provider/src';

interface CompanyTopProps {
  onCreate: () => void;
}
const CompanyTop: FC<CompanyTopProps> = ({ onCreate }) => {
  const { setCreateJobModalOpen } = useLanding();
  return (
    <Flex>
      <Box ml="auto">
        <Button variant="primary" leftIcon={<FileIcon />} onClick={() => {
          onCreate();
          setCreateJobModalOpen(true);            
          }}>
          Create new job
        </Button>
      </Box>
    </Flex>
  );
};

export default CompanyTop;
