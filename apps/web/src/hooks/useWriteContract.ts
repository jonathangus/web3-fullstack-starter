import { useContractWrite } from 'wagmi';
import { Contracts, typechain } from 'web3-config';
import { useMulticallContext } from '../context/MulticallContext';
import { getCacheKey } from '../utils/state-helper';
import useAddress from './useAddress';

type UseWriteContractOptions = {
  onSuccess?: () => void;
  onError?: () => void;
  onSuccessRefetch?: {
    address: string;
    method: string;
    args?: [any];
  };
};

const useWriteContract = (
  contract: Contracts,
  method: string,
  options?: UseWriteContractOptions
): ReturnType<typeof useContractWrite> => {
  const address = useAddress(contract);
  const factory = typechain[`${contract}__factory`];
  const context = useMulticallContext();

  const [{ data, error, loading }, write] = useContractWrite(
    {
      addressOrName: address,
      contractInterface: factory.abi,
    },
    method
  );

  const _write = async () => {
    const result = await write();

    if (options?.onSuccessRefetch) {
      const cacheKey = getCacheKey({
        ...options.onSuccessRefetch,
      });
      context.queueIfNeeded(
        {
          ...options.onSuccessRefetch,
          args: options.onSuccessRefetch.args || [],
          cacheKey,
        },
        factory
      );
    }

    return result;
  };

  return [{ data, error, loading }, _write];
};

export default useWriteContract;
