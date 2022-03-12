import { getAddress, Chains, Contracts } from 'web3-config';

const useAddress = (contract: Contracts): string => {
  return getAddress(Chains.LOCALHOST, contract);
};

export default useAddress;
