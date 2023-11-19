import { Flex } from '@chakra-ui/react';
import { useLanding } from '../../../front-provider/src';
import { FC } from 'react';
import ProductCompany from './company/ProductCompany';
import ProductFreelance from './freelance/ProductFreelance';
import { InView } from 'react-intersection-observer';
import SearchBar from './SearchBar';
import Gallery from './Gallery';
import Partners from './Partners';
import { UserTypeEnum } from '../../../utility/src';
import { SearchFreelancerProvider } from '../../hooks/useSearchFreelancer';
import { SearchJobProvider } from '../../hooks/useSearchJob';
import SearchJobPage from '../../../pages/searchjobs';
import {
  useInkathon,
} from '@scio-labs/use-inkathon'
import SearchFreelancerPage from '@pages/searchfreelancers';

const Product: FC = () => {
  const { type, handleViewChange } = useLanding();
  const { isConnected, activeAccount } = useInkathon();

  let topContent = <></>;
  let searchContent = <></>;

  if (type == UserTypeEnum.Freelancer || type == UserTypeEnum.Guest) {
    topContent = <ProductFreelance />;
    searchContent = <SearchJobPage />;
  }

  if (type == UserTypeEnum.Company) {
    topContent = <ProductCompany />;
    searchContent = <SearchFreelancerPage />;
  }

  return (
    <InView
      as="div"
      id="product"
      onChange={handleViewChange}
      threshold={[0.25, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1]}
    >
      <Flex flexDir="column" pt={16}>
        <Flex mx="auto" width={{base: '90%', lg:"80%"}} maxW="1280px" flexDir="column">
          {topContent}
          <SearchFreelancerProvider>
            <SearchJobProvider>
              {(isConnected && activeAccount) && searchContent}
              {(isConnected && activeAccount) && <Gallery mt={8} />}
            </SearchJobProvider>
          </SearchFreelancerProvider>
        </Flex>
        <Partners mt={16} />
      </Flex>
    </InView>
  );
};

export default Product;
