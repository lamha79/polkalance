import { appWithTranslation } from 'next-i18next';
import type { AppProps } from 'next/app';
import GlobalLayout from '../components/GlobalLayout';

//Import styles
import { darkTheme } from '../themes/src';
import 'react-perfect-scrollbar/dist/css/styles.css';
import '../front/assets/scrollbar.css';

//Import font
import '@fontsource/comfortaa';
import '@fontsource/montserrat';
import CustomHead from '../front/components/CustomHead';
import Providers from '../front/components/Providers';

function App({ Component, pageProps }: AppProps) {
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