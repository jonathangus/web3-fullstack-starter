import { Chains } from 'web3-config';

type Config = {
  defaultChain: Chains;
  isProduction: boolean;
  INFURA_ID: string;
};

export const defaultChain = Chains.LOCALHOST;

const INFURA_ID = process.env.NEXT_PUBLIC_INFURA_ID;

export const config: Config = {
  isProduction: process.env.NODE_ENV === 'production',
  defaultChain,
  INFURA_ID,
};
