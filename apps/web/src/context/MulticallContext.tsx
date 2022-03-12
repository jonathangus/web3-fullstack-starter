import { createContext, FC, useContext, useEffect, useReducer } from 'react';
import { useBlockNumber, useProvider } from 'wagmi';
import { Factory } from 'web3-config';

type QueueOptions = {
  method: string;
  address: string;
  cacheKey: string;
  args?: string[];
};

type State = {
  errors: Record<string, any>;
  loading: Record<string, any>;
  result: Record<string, any>;
  queue: Record<string, Function>;
};
type MulticallContextValue = {
  state: State;
  queueIfNeeded: (options: QueueOptions, factory: Factory) => void;
  removeFromQueue: (options: { cacheKey: string }) => void;
};

const MulticallContext = createContext<MulticallContextValue>(null);

function reducer(state, action): State {
  switch (action.type) {
    case actions.addToQueue:
      return {
        ...state,
        queue: {
          ...state.queue,
          [action.cacheKey]: action.read,
        },
      };

    case actions.removeFromQueue:
      return {
        ...state,
        queue: {
          ...state.queue,
          [action.cacheKey]: undefined,
        },
      };

    case actions.addResult:
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.cacheKey]: undefined,
        },
        result: {
          ...state.result,
          [action.cacheKey]: action.result,
        },
      };

    case actions.addError:
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.cacheKey]: action.error,
        },
      };

    case actions.setLoader:
      if (!action.isLoading) {
        return {
          ...state,
          loading: {
            ...state.loading,
            [action.cacheKey]: false,
          },
        };
      }

      // Dont show loader state if data exist and its just refetching
      if (state.result[action.cacheKey]) {
        return state;
      }

      return {
        ...state,
        loading: {
          ...state.loading,
          [action.cacheKey]: true,
        },
      };

    default:
      throw new Error();
  }
}

const actions = {
  addToQueue: 'addToQueue',
  removeFromQueue: 'removeFromQueue',
  addResult: 'addResult',
  addError: 'addError',
  setLoader: 'setLoader',
};

const initialState: State = {
  queue: {},
  result: {},
  errors: {},
  loading: {},
};

export const MulticallProvider: FC = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const provider = useProvider();
  const [{ data: blockNumber }] = useBlockNumber();

  const queueIfNeeded = (options: QueueOptions, factory: Factory) => {
    const { cacheKey, method, args } = options;
    const read = async () => {
      const contract = factory.connect(options.address, provider);

      try {
        dispatch({ type: actions.setLoader, cacheKey, isLoading: true });
        console.log('call:', method, args);
        const result = await contract[method](...args);
        dispatch({ type: actions.addResult, result, cacheKey });
      } catch (e) {
        console.error(e);
        dispatch({ type: actions.addError, error: e });
      } finally {
        dispatch({ type: actions.setLoader, cacheKey, isLoading: false });
      }
    };

    dispatch({ type: actions.addToQueue, read, cacheKey });
    read();
  };

  const removeFromQueue = (options: QueueOptions) => {
    const { cacheKey } = options;
    dispatch({ type: actions.removeFromQueue, cacheKey });
  };

  useEffect(() => {
    Object.values(state.queue)
      .filter(Boolean)
      .forEach((read: Function) => {
        read();
      });
  }, [blockNumber]);

  const value = {
    state,
    queueIfNeeded,
    removeFromQueue,
  };

  return (
    <MulticallContext.Provider value={value}>
      {children}
    </MulticallContext.Provider>
  );
};

export const useMulticallContext = () => {
  const ctx = useContext(MulticallContext);
  if (!ctx) {
    throw new Error('Missing MulticallContext.Provider');
  }
  return ctx;
};
