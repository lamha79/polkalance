import { Box, Button, Flex, Input, Text } from '@chakra-ui/react';
import { FC } from 'react';
import ArrowRightIcon from '../../icons/ArrowRightIcon';

const Newsletter: FC = () => {
  return (
    <Flex w="100%" flexDir="column" bgColor="#002c39" pt={12} pb={16}>
      <Flex flexDir="column" mx="auto" width="80%" maxW="1280px">
        <Flex flexDir="column">
          <Box textStyle="h3" as="h3" fontFamily={"Comfortaa"} fontSize={"24px"} fontWeight={"700"}
            lineHeight="120%" color="#ffffff">
            Newsletter
          </Box>
          <Text
            fontWeight="700"
            fontSize="20px"
            lineHeight="120%"
            fontFamily="Comfortaa"
            color="#8194ac"
          >
            {`Don't miss any offer !`}
          </Text>
        </Flex>
        <Flex mt={4} columnGap={8} flexDir={{base: 'column', md: 'row'}} rowGap={4}>
          <Input
            placeholder="Your mail"
            bgColor="neutral.white"
            borderRadius="32px"
            borderWidth="2px"
            borderColor="#fdb81e"
            px={4}
            py="10px"
            fontFamily="Comfortaa"
            fontSize="18px"
            lineHeight="120%"
            fontWeight="700"
            _focus={{
              borderWidth: '1px',
              borderColor: 'brand.primaryHover',
              boxShadow: '0 0 0 1px var(--chakra-colors-brand-primaryHover)'
            }}
          />
          <Button variant="primary" backgroundColor={"#fdb81e"} rightIcon={<ArrowRightIcon />}>
            Stay tuned
          </Button>
        </Flex>
      </Flex>
    </Flex>
  );
};

export default Newsletter;
