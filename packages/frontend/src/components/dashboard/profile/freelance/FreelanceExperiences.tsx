import { Box, Button, Divider, Flex } from '@chakra-ui/react';
import { useCurrentUser } from '../../../../front-provider/src';
import AddIcon from '../../../../components/icons/AddIcon';
import { Experience } from '../../../../utility/src';
import { FC, useState } from 'react';
import FreelanceExperienceForm from './FreelanceExperienceForm';
import FreelanceExperiencesLine from './FreelanceExperiencesLine';

const FreelanceExperiences: FC = () => {
  const [showForm, setShowForm] = useState(false);
  const { user } = useCurrentUser();
  const [curExperience, setCurExperience] = useState<Experience>();

  const onEditExperience = (id: string) => {
    // setCurExperience(user?.hasFreelanceProfile.find((v) => v.id === id));
    setShowForm(true);
  };

  return (
    <Flex
      flexDir="column"
      justifyContent="center"
      p={6}
      borderRadius="32px"
      borderWidth="1px"
      borderColor="neutral.gray"
      w="100%"
      gap={4}
      flexBasis="40%"
    >
      <Flex alignItems="center" flexDir={{base: 'column', lg: 'row'}}>
        <Box textStyle="h4" as="span">
          Experiences
        </Box>
        <Box ml={{base: 0, lg: "auto"}} mt={{base: 4, lg: 0}}>
          <Button
            variant="outline"
            leftIcon={
              <Box w="16px" h="16px" mr={2}>
                <AddIcon />
              </Box>
            }
            onClick={() => {
              setCurExperience(undefined);
              setShowForm(true);
            }}
          >
            Add experience
          </Button>
        </Box>
      </Flex>
      {showForm && (
        <FreelanceExperienceForm experience={curExperience} onClose={() => setShowForm(false)} />
      )}
      {showForm &&
        user?.hasFreelanceProfile &&
        user.hasFreelanceProfile && <Divider borderColor="neutral.dsGray" />}
      {user &&
        user.hasFreelanceProfile &&
        user.hasFreelanceProfile.length > 0 && (
          <Flex flexDir="column" gap={4} w="100%">
            
          </Flex>
        )}
    </Flex>
  );
};

export default FreelanceExperiences;
