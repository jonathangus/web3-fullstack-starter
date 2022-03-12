import { Contracts, typechain } from 'web3-config';
import useAddress from './useAddress';
import useMulticallState from './useMulticallState';

type PromiseResolvedType<T> = T extends Promise<infer R> ? R : never;
type ReturnedPromiseResolvedType<T> = PromiseResolvedType<ReturnType<T>>;

function useReadContract<T extends { functions: any }>(
  contract: Contracts,
  method: keyof T['functions'],
  options?: { args: [any]; enabled?: boolean }
): {
  data: ReturnedPromiseResolvedType<
    T['functions'][keyof T['functions']]
  > | void;
  error: Error;
  loading: boolean;
} {
  const args = options?.args || [];
  const enabled = options?.enabled ?? true;
  const address = useAddress(contract);
  const factory = typechain[`${contract}__factory`];

  const value = useMulticallState(
    {
      method,
      address,
      args,
      enabled,
    },
    factory
  );

  return value;
}

export default useReadContract;
