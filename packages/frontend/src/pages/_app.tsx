import { appWithTranslation } from 'next-i18next';
import type { AppProps } from 'next/app';
import GlobalLayout from '../components/GlobalLayout';

//Import styles
import { darkTheme } from '../themes/src';
import 'react-perfect-scrollbar/dist/css/styles.css';
import '../assets/scrollbar.css';

//Import font
import '@fontsource/comfortaa';
import '@fontsource/montserrat';
import CustomHead from '../components/CustomHead';
import Providers from '../components/Providers';
import { useLanding } from '@front-provider/src';
import Product from '../components/landing/product/Product';
import { useEffect } from 'react';
import { UserTypeEnum } from '@utility/src';

function App({ Component, pageProps }: AppProps) {
  // const { setType, type } = useLanding();

  // useEffect(() => {
  //   if (!type) {
  //     setType(UserTypeEnum.Guest);
  //   }
    
  // }, [type]);

  return (
    <>
      <CustomHead />
      <Providers theme={darkTheme}>
        <GlobalLayout>
          <Component {...pageProps} />
        </GlobalLayout>
      </Providers>
    </>
  );
}

export default App;