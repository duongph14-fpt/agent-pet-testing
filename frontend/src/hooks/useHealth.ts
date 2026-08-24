import { useEffect, useState } from 'react';
import { fetchHealth, HealthStatus } from '../api/health';

type State =
  | { status: 'loading' }
  | { status: 'error'; error: string }
  | { status: 'ready'; data: HealthStatus };

export function useHealth(): State {
  const [state, setState] = useState<State>({ status: 'loading' });

  useEffect(() => {
    let active = true;

    fetchHealth()
      .then((data) => {
        if (active) setState({ status: 'ready', data });
      })
      .catch((err: unknown) => {
        if (active) {
          setState({
            status: 'error',
            error: err instanceof Error ? err.message : 'Unknown error',
          });
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return state;
}
