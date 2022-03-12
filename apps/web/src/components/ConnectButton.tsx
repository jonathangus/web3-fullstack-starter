import { FC } from 'react';
import { useAccount, useConnect } from 'wagmi';

export const ConnectButton: FC = () => {
  const [{ data, error }, connect] = useConnect();
  const [{ data: accountData }, disconnect] = useAccount({
    fetchEns: true,
  });

  if (accountData) {
    return <div>{accountData.address}</div>;
  }

  return (
    <div>
      {data.connectors.map((connector) => (
        <button
          disabled={!connector.ready}
          key={connector.id}
          onClick={() => {
            try {
              connect(connector);
            } catch (e) {}
          }}
        >
          {connector.name}
          {!connector.ready && ' (unsupported)'}
        </button>
      ))}

      {error && <div>{error?.message ?? 'Failed to connect'}</div>}
    </div>
  );
};

export default ConnectButton;
