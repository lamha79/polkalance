import { ChakraProvider, ChakraProviderProps } from '@chakra-ui/react';
import {
  CurrentCompanyProvider,
  CurrentUserProvider,
  JobsProvider,
  LandingProvider
} from '../front-provider/src';
import { FC, ReactNode } from 'react';
import { UseInkathonProvider } from '@scio-labs/use-inkathon'
import { env } from '../components/config/environment'
import { getDeployments } from '../deployments/deployments'

interface ProvidersProps {
  children: ReactNode;
  theme: ChakraProviderProps['theme'];
}

const Providers: FC<ProvidersProps> = ({ children, theme }) => {
  return (
    <UseInkathonProvider appName="Polkalance" // TODO
      connectOnInit={true}
      defaultChain={env.defaultChain}
      deployments={getDeployments()}>
        <ChakraProvider resetCSS theme={theme}>
      <CurrentUserProvider>
          <CurrentCompanyProvider>
            <JobsProvider>
              <LandingProvider>{children}</LandingProvider>
            </JobsProvider>
          </CurrentCompanyProvider>
        </CurrentUserProvider>
    </ChakraProvider>
      </UseInkathonProvider>
  );
};

export default Providers;
