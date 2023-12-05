import { Box, Button, Flex, SimpleGrid, Spinner } from '@chakra-ui/react';
import { FC, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useSearchJob } from '../../../../components/hooks/useSearchJob';
import { useCurrentUser } from '../../../../front-provider/src';
import { useRecentJob } from '../../../hooks/useRecentJob';
import JobCard from '../../../../components/card/JobCard';
import { useResponsive } from '../../../hooks/useResponsive';

const FreelanceOffers: FC = () => {
  const { push } = useRouter();
  const { user } = useCurrentUser();
  const { jobs1, loading, handleSearch } = useSearchJob();
  const {mobileDisplay, tabletDisplay, desktopDisplay} = useResponsive();
  const [fetching, setFetching] = useState(false);
  const recentJob = useRecentJob({ limit: 2 });

  const handleJobCardClick = (id: string) => {
    push(`/dashboard/offers/${id}`);
  };

  useEffect(() => {
    if (user && user.hasFreelanceProfile) {
      setFetching(true);
      handleSearch(1, 2, []);
    }
  }, [user]);

  useEffect(() => {
    if (!loading) {
      setFetching(false);
    }
  }, [loading])

  return (
    <Flex flexDir="column" gap={4}>
      <Flex justifyContent="space-between" alignItems="center">
        <Box textStyle="h4" as="h3" color="neutral.black">
          Other jobs that match your interests
        </Box>
        <Box>
          {/* <Button variant="link" p={0}>
            See more
          </Button> */}
        </Box>
      </Flex>
      {(loading && fetching) && (
        <Flex flexDir="column" justifyContent="center" alignItems="center" my={16}>
          <Spinner color="brand.primary" size="xl" mx="auto" />
          <Box textStyle="h6" as="span" color="brand.secondary" mt={8}>
            Loading Offers
          </Box>
        </Flex>
      )}
      {(!loading || !fetching) && (
        <Flex flexDir="column">
          <SimpleGrid columns={{base: 1, lg: 2}} spacing={8} w="100%">
            {jobs1 &&
              jobs1?.length > 0 &&
              jobs1.map((j, k) => <JobCard job1={j} key={k} onClick={handleJobCardClick} />)}
            {((jobs1 && jobs1.length === 0) || !jobs1) &&
                recentJob.jobs1.map((j, k) => (
                  <JobCard job1={j} key={k} onClick={handleJobCardClick} />
                ))}
          </SimpleGrid>
        </Flex>
      )}
    </Flex>
  );
};

export default FreelanceOffers;
