import { useEffect } from 'react';
import { useMulticallContext } from '../context/MulticallContext';
import { getCacheKey, MulticallStateOptions } from '../utils/state-helper';

type UseMultiCallStateReturn = {
  data: any;
  error: Error;
  loading: boolean;
};

const useMulticallState = (
  options: MulticallStateOptions & { enabled: boolean },
  factory
): UseMultiCallStateReturn => {
  const { method, address, args, enabled } = options;
  const cacheKey = getCacheKey(options);
  const context = useMulticallContext();

  useEffect(() => {
    if (enabled) {
      context.queueIfNeeded({ cacheKey, method, address, args }, factory);
    }

    return () => {
      context.removeFromQueue({ cacheKey });
    };
  }, [enabled, cacheKey]);

  const data = context.state.result[cacheKey];
  const error = context.state.errors[cacheKey];
  const loading = context.state.loading[cacheKey];

  return {
    data,
    error,
    loading,
  };
};

export default useMulticallState;
