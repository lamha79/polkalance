import { Avatar, Badge, Box, Button, Flex, Text } from '@chakra-ui/react';
import { useColoredBadges } from '../hooks/useColoredBadges';
import { User } from '../../utility/src';
import { FC } from 'react';
import DollarIcon from '../icons/DollarIcon';
import StarIcon from '../icons/StarIcon';
import { useResponsive } from '../hooks/useResponsive';

interface FreelanceCardProps {
  user: User;
  blurred?: boolean;
  onClick?: (id: string) => void;
}

const FreelanceCard: FC<FreelanceCardProps> = ({
  user,
  blurred = false,
  onClick
}: FreelanceCardProps) => {
  const { getCategoryColorForSkill } = useColoredBadges();
  const {desktopDisplay, mobileDisplay} = useResponsive();

  const skillLimit = desktopDisplay ? 45 : mobileDisplay ? 25 : 35

  let skillsLength = 0;
  return (
    <Box
      p={6}
      borderColor="neutral.gray"
      borderWidth="1px"
      borderRadius="32px"
      bgColor="white"
      cursor="pointer"
      position="relative"
    >
      <Flex>
        <Avatar w="48px" h="48px" borderRadius="16px" />
        <Flex flexDir="column" ml={4} justifyContent="center">
          <Text
            fontFamily="Comfortaa"
            fontWeight="700"
            fontSize="20px"
            lineHeight="120%"
            color="neutral.black"
          >
            {user.firstname} {user.lastname}
          </Text>
          <Flex alignItems="center">
            <Flex alignItems="center">
              <Text
                fontFamily="Montserrat"
                fontWeight="400"
                fontSize="14px"
                lineHeight="150%"
                color="neutral.black"
              >
                4,9/5
              </Text>
              <Box color="brand.primary" ml={1}>
                <StarIcon />
              </Box>
            </Flex>
            <Flex alignItems="center" ml={2}>
              <Text
                fontFamily="Montserrat"
                fontWeight="400"
                fontSize="14px"
                lineHeight="150%"
                color="neutral.black"
              >
                {user.hasFreelanceProfile} /hr
              </Text>
              <Box color="brand.green" ml={1}>
                <DollarIcon />
              </Box>
            </Flex>
          </Flex>
        </Flex>
      </Flex>
      <Flex flexDir="column" mt={4}>
        <Text
          fontFamily="Comfortaa"
          fontWeight="700"
          fontSize="16px"
          lineHeight="120%"
          color="neutral.black"
        >
          {user.description}
        </Text>
        <Text
          fontFamily="Comfortaa"
          fontWeight="700"
          fontSize="14px"
          lineHeight="120%"
          color="neutral.dsGray"
        >
          {user.location}
        </Text>
      </Flex>
      <Flex mt={2} flexWrap='wrap' rowGap={2}>
        {user.hasFreelanceProfile && (
          <Badge
            color="neutral.black"
            bgColor="neutral.gray"
            borderWidth="1px"
            borderColor={'none'}
            variant="filter"
            mr={2}
          >
            {user.hasFreelanceProfile}
          </Badge>
        )}
        {user.hasFreelanceProfile && (
          <Badge
            color="neutral.black"
            bgColor="neutral.gray"
            borderWidth="1px"
            borderColor={'none'}
            variant="filter"
            mr={2}
          >
            {user.hasFreelanceProfile}
          </Badge>
        )}
        {user.hasFreelanceProfile && (
          <Badge
            color="neutral.black"
            bgColor="neutral.gray"
            borderWidth="1px"
            borderColor={'none'}
            variant="filter"
            mr={2}
          >
            {user.hasFreelanceProfile}
          </Badge>
        )}
        {user.hasFreelanceProfile && (
          <Badge
            color="neutral.black"
            bgColor="neutral.gray"
            cursor="default"
            borderWidth="1px"
            borderColor={'none'}
            variant="filter"
            mr={2}
          >
            {user.hasFreelanceProfile.toString()} hrs/week
          </Badge>
        )}
        {user.hasFreelanceProfile && (
          <Badge
            color="neutral.black"
            bgColor="neutral.gray"
            borderWidth="1px"
            borderColor={'none'}
            variant="filter"
            mr={2}
          >
            {user.hasFreelanceProfile}{' '}
            {user.hasFreelanceProfile != undefined &&
            parseInt(user.hasFreelanceProfile) > 1
              ? 'Years'
              : 'Year'}{' '}
            of Exp
          </Badge>
        )}
      </Flex>
      <Flex mt={4} px={1} minHeight="110px">
        <Text
          as="span"
          fontFamily="Montserrat"
          fontWeight="500"
          fontSize="14px"
          lineHeight="150%"
          color="neutral.dsGray"
        >
          {user.hasFreelanceProfile}
        </Text>
      </Flex>
      <Flex mt={4} flexWrap="wrap" rowGap={2}>
        {Array.from({ length: 6 }).map((_, k) => {
          if (user.hasFreelanceProfile && user.hasFreelanceProfile) {
            const skill = user.hasFreelanceProfile;
            skillsLength += skill.length;
            if (skillsLength <= skillLimit) {
              const colors = getCategoryColorForSkill(skill);

              return (
                <Badge
                  mr={2}
                  key={k}
                  color={colors.color}
                  bgColor={colors.bgColor}
                  borderWidth="1px"
                  borderColor={'none'}
                  variant="filter"
                >
                  {skill}
                </Badge>
              );
            }
          }
        })}
        {!mobileDisplay && <Button
          ml="auto"
          variant="outline"
          px="12px !important"
          py="2px !important"
          bgColor="white"
          borderColor="neutral.gray"
          fontSize="14px"
          fontWeight="400"
          lineHeight="100%"
          maxH="26px"
          onClick={() => onClick?.(user.wallet)}
        >
          See more
        </Button>}
      </Flex>
      {mobileDisplay && <Button
          mt={2}
          variant="outline"
          px="12px !important"
          py="2px !important"
          bgColor="white"
          borderColor="neutral.gray"
          fontSize="14px"
          fontWeight="400"
          lineHeight="100%"
          maxH="26px"
          onClick={() => onClick?.(user.wallet)}
        >
          See more
        </Button>}
      {blurred && (
        <Box
          position="absolute"
          background="linear-gradient(180deg, rgba(217, 217, 217, 0) 10%, #EDF2F7 100%)"
          w="102%"
          h="102%"
          top="-1%"
          left="-1%"
        ></Box>
      )}
    </Box>
  );
};

export default FreelanceCard;
