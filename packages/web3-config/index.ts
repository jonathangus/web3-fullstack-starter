import multicallDeploymentLocalhost from './deployments/localhost/Multicall2.json';
import counterDeploymentLocalhost from './deployments/localhost/Counter.json';
export * from './typechain';
import * as _typechain from './typechain';

import { Multicall2__factory, Counter__factory } from './typechain';

export enum Chains {
  LOCALHOST = 1337,
  // RINKEBY = 4,
}

export const typechain = _typechain;

export type AvailableContracts =
  | Multicall2__factory['contractName']
  | Counter__factory['contractName'];

type AddressObj = Record<AvailableContracts, string>;

const _multicall2 = new Multicall2__factory();
const _counter = new Counter__factory();

export const Address: Record<Chains, AddressObj> = {
  [Chains.LOCALHOST]: {
    [_multicall2.contractName]: multicallDeploymentLocalhost.address,
    [_counter.contractName]: counterDeploymentLocalhost.address,
  },
};

export const getAddress = (
  chain: Chains,
  contract: AvailableContracts
): string => Address[chain][contract];

export type Factory = any;
