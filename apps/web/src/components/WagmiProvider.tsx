import { Provider, chain, Connector, defaultChains, Chain } from 'wagmi';
import { FC } from 'react';
import { ethers, providers } from 'ethers';

import { InjectedConnector } from 'wagmi/connectors/injected';
import { Chains } from 'web3-config';

const defaultChain = chain.rinkeby;

const chains: Chain[] = [
  ...defaultChains,
  {
    blockExplorers: [],
    id: Chains.LOCALHOST,
    name: 'Localhost',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: [`http://localhost:8545`],
  },
];

export const METAMASK_CONNECTOR = new InjectedConnector({
  chains,
});

const connectors = () => [
  new InjectedConnector({
    chains,
  }),
];

type ProviderConfig = { chainId?: number; connector?: Connector };
const validChains = [Chains.LOCALHOST];

const provider = ({ chainId }: ProviderConfig) => {
  if (chainId === chain.localhost.id || !chainId) {
    return new ethers.providers.JsonRpcProvider('http://127.0.0.1:8545/');
  }

  return providers.getDefaultProvider(
    validChains.includes(chainId as any) ? chainId : defaultChain.id
  );
};

const WagmiProvider: FC = ({ children }) => (
  <Provider autoConnect connectors={connectors} provider={provider}>
    {children}
  </Provider>
);

export default WagmiProvider;
