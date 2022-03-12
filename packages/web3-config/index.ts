import counterDeploymentLocalhost from './deployments/localhost/Counter.json';
export * from './typechain';
import * as _typechain from './typechain';

export enum Chains {
  LOCALHOST = 1337,
}

export const typechain = _typechain;

export const RPC_URL = {};

export enum Contracts {
  Counter = 'Counter',
}

export type Factory = typeof _typechain[`${Contracts}__factory`];

export const Address: Record<Chains, any> = {
  [Chains.LOCALHOST]: {
    [Contracts.Counter]: counterDeploymentLocalhost.address,
  },
};

export const abi: Record<Chains, any> = {
  [Chains.LOCALHOST]: {
    [Contracts.Counter]: counterDeploymentLocalhost.abi,
  },
};

export const getAddress = (chain: Chains, contract: Contracts): string =>
  Address[chain][contract];
