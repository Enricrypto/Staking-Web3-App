import * as React from 'react';
import type { AppProps } from 'next/app';
import NextHead from 'next/head';
import '../styles/globals.css';
import '@rainbow-me/rainbowkit/styles.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { config } from '../config'; 

import { WagmiProvider, http } from 'wagmi';
import { RainbowKitProvider, getDefaultConfig } from '@rainbow-me/rainbowkit';

const queryClient = new QueryClient(); 

import { useIsMounted } from '../hooks';
const App = ({ Component, pageProps }: AppProps) => {
  const isMounted = useIsMounted();

  if (!isMounted) return null;
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
      <RainbowKitProvider>
        <NextHead>
          <title>create-web3</title>
        </NextHead>
        <Component {...pageProps} />
      </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

export default App;
