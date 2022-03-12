import { FC } from 'react';
import { useAccount } from 'wagmi';
import { Contracts, Counter } from 'web3-config';
import useAddress from '../hooks/useAddress';
import useReadContract from '../hooks/useReadContract';
import useWriteContract from '../hooks/useWriteContract';

const Counter: FC = () => {
  const [{ data: accountData }] = useAccount({
    fetchEns: true,
  });
  const { data, error } = useReadContract<Counter>(
    Contracts.Counter,
    'getCount',
    {
      args: [accountData?.address],
      enabled: !!accountData?.address,
    }
  );

  const counterAddress = useAddress(Contracts.Counter);
  const [increaseState, increase] = useWriteContract(
    Contracts.Counter,
    'incrementCounter',
    {
      onSuccessRefetch: {
        address: counterAddress,
        method: 'getCount',
        args: [accountData?.address],
      },
    }
  );

  return (
    <div>
      {data && <div>Count: {data.toString()}</div>}
      {increaseState.loading && 'Loading...'}
      <button onClick={() => increase()}>Increase</button>
    </div>
  );
};

export default Counter;
