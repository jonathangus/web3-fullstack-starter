import type { AppProps } from 'next/app';
import React from 'react';
import WagmiProvider from '../components/WagmiProvider';
import { MulticallProvider } from '../context/MulticallContext';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <WagmiProvider>
      <MulticallProvider>
        <Component {...pageProps} />
      </MulticallProvider>
    </WagmiProvider>
  );
}

export default MyApp;
