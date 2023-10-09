import { Box, Button, Flex, SimpleGrid, SimpleGridProps, Spinner } from '@chakra-ui/react'
import { useLanding } from '../../../../front-provider/src'
import { FC, useEffect, useState } from 'react'
import FreelanceCard from '../../card/FreelanceCard'
import { UserTypeEnum } from '../../../../utility/src'
import { useRecentFreelancer } from '../../../../front/hooks/useRecentFreelancer'
import { useSearchFreelancer } from '../../../../front/hooks/useSearchFreelancer'
import { useRecentJob } from '../../../../front/hooks/useRecentJob'
import JobCard from '../../card/JobCard'
import { useSearchJob } from '../../../../front/hooks/useSearchJob'
import { useResponsive } from '../../../../front/hooks/useResponsive'

const Gallery: FC<SimpleGridProps> = ({ ...props }: SimpleGridProps) => {
  const { type, setSignupModalOpen } = useLanding()
  const [caption, setCaption] = useState<string>('')
  const recentFreelancer = useRecentFreelancer({ limit: 8 })
  const recentJob = useRecentJob({ limit: 8 })
  const searchFreelance = useSearchFreelancer(8)
  const searchJobs = useSearchJob(8)

  const { mobileDisplay, tabletDisplay } = useResponsive()

  const blurredAt = mobileDisplay || tabletDisplay ? 7 : 6

  useEffect(() => {
    if (type === UserTypeEnum.Freelancer) {
      setCaption('Join us and find your perfect offer')
    }
    if (type === UserTypeEnum.Company) {
      setCaption('Join us and find your perfect freelancer')
    }
  }, [type])

  return (
    <Flex
      w="100%"
      flexDir="column"
      textColor={'#002c39'}
      fontFamily={'Comfortaa'}
      fontSize={'24px'}
      fontWeight={'700'}
      lineHeight={'133%'}
      position="relative"
      pb={6}
    >
      {type == UserTypeEnum.Company && recentFreelancer.loading && (
        <Flex
          flexDir="column"
          justifyContent="center"
          alignItems="center"
          my={16}
          w="100%"
          position="relative"
        >
          <Spinner color="brand.primary" size="xl" mx="auto" />
          <Box textStyle="h6" as="span" color="brand.secondary" mt={8}>
            Loading Offers
          </Box>
        </Flex>
      )}
      {type == UserTypeEnum.Company && !recentFreelancer.loading && (
        <SimpleGrid
          columns={{ base: 1, lg: 2 }}
          spacing={8}
          w="100%"
          position="relative"
          zIndex="1"
          pb={16}
          {...props}
        >
          {searchFreelance.searchFilters.length === 0 &&
            recentFreelancer.freelancers.map((v, k) => (
              <FreelanceCard key={k} user={v} blurred={k >= blurredAt} />
            ))}
          {searchFreelance.searchFilters.length > 0 &&
            searchFreelance.freelancers.map((v, k) => (
              <FreelanceCard
                key={k}
                user={v}
                blurred={
                  mobileDisplay || tabletDisplay
                    ? k >= searchFreelance.freelancers.length - 1
                    : searchFreelance.freelancers.length % 2 === 0
                    ? k >= searchFreelance.freelancers.length - 2
                    : k >= searchFreelance.freelancers.length - 1
                }
              />
            ))}
        </SimpleGrid>
      )}
      {type == UserTypeEnum.Freelancer && recentJob.loading && (
        <Flex
          flexDir="column"
          justifyContent="center"
          alignItems="center"
          my={16}
          w="100%"
          position="relative"
        >
          <Spinner color="brand.primary" size="xl" mx="auto" />
          <Box
            textStyle="h6"
            as="span"
            textColor={'#002c39'}
            fontFamily={'Comfortaa'}
            fontSize={'16px'}
            fontWeight={'700'}
            lineHeight={'120%'}
            mt={8}
          >
            Loading Jobs
          </Box>
        </Flex>
      )}
      {type == UserTypeEnum.Freelancer && !recentJob.loading && (
        <SimpleGrid
          columns={{ base: 1, lg: 2 }}
          spacing={8}
          w="100%"
          position="relative"
          zIndex="1"
          pb={16}
          {...props}
        >
          {searchJobs.searchFilters.length === 0 &&
            recentJob.jobs.map((v, k) => <JobCard key={k} job={v} blurred={k >= blurredAt} />)}
          {searchJobs.searchFilters.length > 0 &&
            searchJobs.jobs.map((v, k) => (
              <JobCard
                key={k}
                job={v}
                blurred={
                  mobileDisplay || tabletDisplay
                    ? k >= searchJobs.jobs.length - 1
                    : searchJobs.jobs.length % 2 === 0
                    ? k >= searchJobs.jobs.length - 2
                    : k >= searchJobs.jobs.length - 1
                }
              />
            ))}
        </SimpleGrid>
      )}
      <Flex
        flexDir="column"
        justifyContent="end"
        pb={4}
        alignItems="center"
        w="100%"
        position="absolute"
        zIndex="2"
        bottom={recentFreelancer.loading || recentJob.loading ? '-50' : '0'}
      >
        <Box textStyle="h3" as="h3" w="100%" textAlign="center" cursor="default">
          {caption}
        </Box>
        <Box mt={4}>
          <Button
            variant="primary"
            backgroundColor={'#fdb81e'}
            size="md"
            onClick={() => setSignupModalOpen(true)}
          >
            Sign up
          </Button>
        </Box>
      </Flex>
    </Flex>
  )
}

export default Gallery
