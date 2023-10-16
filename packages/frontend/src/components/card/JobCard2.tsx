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
import { useLanding } from '@front-provider/src';

///////
const getDay = (date: string) => {
  const a = parseInt(date.replace(/,/g, ''));
  const newdate = new Date(a);
  return  newdate.toLocaleString()
}
///////

interface JobCardProps {
  job: CreateJob;
  blurred?: boolean;
  onClick?: () => void;
  onClick1?: () => void;
}
const JobCard: FC<JobCardProps> = ({ job, blurred = false, onClick, onClick1 }: JobCardProps) => {
  const { getCategoryColorForSkill } = useColoredBadges();
  const {desktopDisplay, mobileDisplay} = useResponsive();
  const {activeAccountUser} = useLanding();

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
            {job?.name} 
          </Text>
          {/* <Text
            fontFamily="Comfortaa"
            fontWeight="700"
            fontSize="16px"
            lineHeight="120%"
            color="neutral.dsGray"
          >
            {job?.description}
          </Text> */}
        </Flex>
        <Flex flexDir="column" ml="auto">
          <Box textStyle="h5" as="span" color="neutral.dsGray">
            {job?.endTime && (
              <>End Time: {getDay(job.endTime)}</>
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
          NAME: {job.name}
        </Text>
        <Text
          fontFamily="Comfortaa"
          fontWeight="700"
          fontSize="14px"
          lineHeight="120%"
          color="neutral.dsGray"
        >
          STATUS: {job.status}
        </Text>
        {job.status === "REVIEW" &&<Text
          fontFamily="Comfortaa"
          fontWeight="700"
          fontSize="14px"
          lineHeight="120%"
          color="neutral.dsGray"
        >
          RESULT: {job.result}
        </Text>}
      </Flex>
      <Flex mt={2} flexWrap='wrap' rowGap={2}>
        {job.description && (
          <Badge
            color="neutral.black"
            bgColor="neutral.gray"
            borderWidth="1px"
            borderColor={'none'}
            variant="filter"
            mr={2}
          >
            {workLocationOptions[job.description]}
          </Badge>
        )}
        {job?.personCreate && (
          <Badge
            color="neutral.black"
            bgColor="neutral.gray"
            borderWidth="1px"
            borderColor={'none'}
            variant="filter"
            mr={2}
          >
            {availabilityOptions[job.personCreate]}
          </Badge>
        )}
        {job.endTime && (
          <Badge
            color="neutral.black"
            bgColor="neutral.gray"
            borderWidth="1px"
            borderColor={'none'}
            variant="filter"
            mr={2}
          >
            {/* {job.endTime !== 0 && (
              <>
                {job.endTime} {job.endTime > 1 ? 'years' : 'year'}
              </>
            )}
            {job.duration.months !== 0 && (
              <>
                {job.duration.months} {job.duration.months > 1 ? 'months' : 'month'}
              </>
            )}
            {job.duration.days !== 0 && (
              <>
                {job.duration.days} {job.duration.days > 1 ? 'days' : 'day'}
              </>
            )}
            {job.duration.hours !== 0 && (
              <>
                {job.duration.hours} {job.duration.hours > 1 ? 'hours' : 'hour'}
              </>
            )} */}
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
          {/* {job.name.slice(0, 380)} {job.name.length > 380 && '...'} */}
        </Text>
      </Flex>
      <Flex mt={4} flexWrap="wrap" rowGap={2}>
        {!mobileDisplay && activeAccountUser && job.status == ("OPEN" || job.status == "REOPEN") && <Button
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
          onClick={() => onClick?.()}
        >
          Obtain
        </Button>}
        {!mobileDisplay && activeAccountUser && job.status == ("DOING") && <Button
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
          onClick={() => onClick?.()}
        >
          Submit
        </Button>}
        {!mobileDisplay && activeAccountUser && job.status == "REVIEW" && <Button
          ml="left"
          variant="outline"
          px="12px !important"
          py="2px !important"
          bgColor="white"
          borderColor="neutral.gray"
          fontSize="14px"
          fontWeight="400"
          lineHeight="100%"
          maxH="26px"
          onClick={() => onClick1?.()}
        >
          Reject
        </Button>}
        {!mobileDisplay && activeAccountUser && job.status == "REVIEW" && <Button
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
          onClick={() => onClick?.()}
        >
          Aproval
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
          onClick={() => onClick?.()}
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

export default JobCard;
