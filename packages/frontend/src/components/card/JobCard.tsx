import { Avatar, Badge, Box, Button, Flex, Text } from '@chakra-ui/react';
import { useColoredBadges } from '../hooks/useColoredBadges';
import { useGetCompanyById } from '../hooks/useGetCompanyById';
import {
  availabilityOptions,
  CreateJob,
  CreateJob1,
  getDateDiffWithDaysAndHours,
  workLocationOptions
} from '../../utility/src';
import { FC, useEffect } from 'react';
import DollarIcon from '../icons/DollarIcon';
import StarIcon from '../icons/StarIcon';
import { useResponsive } from '../hooks/useResponsive';

interface JobCardProps {
  job1: CreateJob1;
  blurred?: boolean;
  onClick?: (id: string) => void;
}
const JobCard: FC<JobCardProps> = ({ job1, blurred = false, onClick }: JobCardProps) => {
  const { getCategoryColorForSkill } = useColoredBadges();
  const {desktopDisplay, mobileDisplay} = useResponsive();

  let skillsLength = 0;
  const skillLimit = desktopDisplay ? 45 : mobileDisplay ? 25 : 35
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
            {job1?.company?.name}
          </Text>
          <Text
            fontFamily="Comfortaa"
            fontWeight="700"
            fontSize="16px"
            lineHeight="120%"
            color="neutral.dsGray"
          >
            {job1?.company?.title}
          </Text>
        </Flex>
        <Flex flexDir="column" ml="auto">
          <Box textStyle="h5" as="span" color="neutral.dsGray">
            {job1?.createdAt && (
              <>{getDateDiffWithDaysAndHours(job1?.createdAt, new Date().toISOString()) + ' ago'}</>
            )}
          </Box>
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
          {job1.title}
        </Text>
        <Text
          fontFamily="Comfortaa"
          fontWeight="700"
          fontSize="14px"
          lineHeight="120%"
          color="neutral.dsGray"
        >
          {job1.company?.location}
        </Text>
      </Flex>
      <Flex mt={2} flexWrap='wrap' rowGap={2}>
        {job1.location && (
          <Badge
            color="neutral.black"
            bgColor="neutral.gray"
            borderWidth="1px"
            borderColor={'none'}
            variant="filter"
            mr={2}
          >
            {workLocationOptions[job1.location]}
          </Badge>
        )}
        {job1?.availability && (
          <Badge
            color="neutral.black"
            bgColor="neutral.gray"
            borderWidth="1px"
            borderColor={'none'}
            variant="filter"
            mr={2}
          >
            {availabilityOptions[job1.availability]}
          </Badge>
        )}
        {job1.duration && (
          <Badge
            color="neutral.black"
            bgColor="neutral.gray"
            borderWidth="1px"
            borderColor={'none'}
            variant="filter"
            mr={2}
          >
            {job1.duration.years !== 0 && (
              <>
                {job1.duration.years} {job1.duration.years > 1 ? 'years' : 'year'}
              </>
            )}
            {job1.duration.months !== 0 && (
              <>
                {job1.duration.months} {job1.duration.months > 1 ? 'months' : 'month'}
              </>
            )}
            {job1.duration.days !== 0 && (
              <>
                {job1.duration.days} {job1.duration.days > 1 ? 'days' : 'day'}
              </>
            )}
            {job1.duration.hours !== 0 && (
              <>
                {job1.duration.hours} {job1.duration.hours > 1 ? 'hours' : 'hour'}
              </>
            )}
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
          {job1.jobMission.slice(0, 380)} {job1.jobMission.length > 380 && '...'}
        </Text>
      </Flex>
      <Flex mt={4} flexWrap="wrap" rowGap={2}>
        {Array.from({ length: 6 }).map((_, k) => {
          if (job1.tags && job1.tags[k]) {
            const skill = job1.tags[k];
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
        {/* {!mobileDisplay && <Button
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
          onClick={() => onClick?.(job1.uuid)}
        >
          See more
        </Button>} */}
      </Flex>
      {/* {mobileDisplay && <Button
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
          onClick={() => onClick?.(job1.uuid)}
        >
          See more
        </Button>} */}
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

export default JobCard;
