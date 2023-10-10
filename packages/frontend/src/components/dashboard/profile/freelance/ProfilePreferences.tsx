import { Badge, Box, Flex } from '@chakra-ui/react';
import { User } from '../../../utility/src';
import { FC } from 'react';

interface ProfilePreferencesProps {
  curUser: User;
}

const ProfilePreferences: FC<ProfilePreferencesProps> = ({ curUser }) => {
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
      flexBasis="60%"
    >
      <Box textStyle="h4" as="span">
        Preferences
      </Box>
      <Flex gap={2} flexWrap="wrap">
        {curUser.hasfreelanceProfile && (
          <Badge
            color="neutral.black"
            bgColor="neutral.gray"
            cursor="default"
            borderWidth="1px"
            borderColor={'none'}
            variant="filter"
          >
            {curUser.hasfreelanceProfile}
          </Badge>
        )}
        {curUser.hasfreelanceProfile && (
          <Badge
            color="neutral.black"
            bgColor="neutral.gray"
            cursor="default"
            borderWidth="1px"
            borderColor={'none'}
            variant="filter"
          >
            {curUser.hasfreelanceProfile}
          </Badge>
        )}
        {curUser.hasfreelanceProfile && (
          <Badge
            color="neutral.black"
            bgColor="neutral.gray"
            cursor="default"
            borderWidth="1px"
            borderColor={'none'}
            variant="filter"
          >
            {curUser.hasfreelanceProfile}
          </Badge>
        )}
        {curUser.hasfreelanceProfile !== 0 && curUser.hasfreelanceProfile && (
          <Badge
            color="neutral.black"
            bgColor="neutral.gray"
            cursor="default"
            borderWidth="1px"
            borderColor={'none'}
            variant="filter"
          >
            {curUser.hasfreelanceProfile.toString()} hrs/week
          </Badge>
        )}
        {curUser.hasfreelanceProfile && (
          <Badge
            color="neutral.black"
            bgColor="neutral.gray"
            borderWidth="1px"
            borderColor={'none'}
            cursor="default"
            variant="filter"
            mr={2}
          >
            {curUser.hasfreelanceProfile}{' '}
            {curUser.hasfreelanceProfile != undefined &&
            parseInt(curUser.hasfreelanceProfile) > 1
              ? 'Years'
              : 'Year'}{' '}
            of Exp
          </Badge>
        )}
      </Flex>
    </Flex>
  );
};

export default ProfilePreferences;
