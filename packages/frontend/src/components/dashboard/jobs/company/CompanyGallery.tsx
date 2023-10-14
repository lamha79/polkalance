import { Box, Flex, SimpleGrid, Spinner } from '@chakra-ui/react'
import { useJobs } from '../../../../front-provider/src'
import JobCard from '../../../../components/card/JobCard'
import { useRouter } from 'next/router'
import { FC } from 'react'

const CompanyGallery: FC = () => {
  const { jobs1, jobsFetching } = useJobs()
  const { push } = useRouter()

  return (
    <Flex flexDir="column">
      {!jobsFetching && (
        <>
          {jobs1 && jobs1?.length > 0 && (
            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8} w="100%">
              {jobs1?.map((j, k) => (
                <JobCard job1={j} key={k} onClick={(id) => push(`/dashboard/offers/${id}`)} />
              ))}
            </SimpleGrid>
          )}
          {!jobs1 ||
            (jobs1.length === 0 && (
              <Box
                textStyle="body2"
                as="span"
                textAlign="center"
                position="absolute"
                top="50%"
                left="50%"
                transform="translate(-50%, -50%)"
              >
                No jobs available
              </Box>
            ))}
        </>
      )}
      {jobsFetching && (
        <Flex
          flexDir="column"
          justifyContent="center"
          alignItems="center"
          my={16}
          position="absolute"
          top="50%"
          left="50%"
          transform="translate(-50%;-50%)"
        >
          <Spinner color="brand.primary" size="xl" mx="auto" />
          <Box
            textStyle="h6"
            as="span"
            color="#002c39"
            font-family={'Comfortaa'}
            font-size={'16px'}
            font-weight={'700'}
            line-height={'120%'}
            mt={8}
          >
            Loading Jobs
          </Box>
        </Flex>
      )}
    </Flex>
  )
}

export default CompanyGallery
