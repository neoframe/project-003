import { useEffect, useReducer } from 'react';
import { mockState } from '@poool/junipero-utils';
import { useInterval } from '@poool/junipero-hooks';

import styles from './index.module.sass';

export default ({ server, username }) => {
  const [state, dispatch] = useReducer(mockState, {
    kills: [],
  });

  useEffect(() => {
    server.on('player-killed', onPlayerKilled);
    server.on('player-dead', onPlayerKilled);

    return () => {
      server.off('player-killed', onPlayerKilled);
      server.off('player-dead', onPlayerKilled);
    };
  }, []);

  useInterval(() => {
    state.kills = state.kills.filter(k => Date.now() - k.createdAt < 5000);
    dispatch({ kills: state.kills });
  }, 1000, []);

  const onPlayerKilled = ({ username, killerUsername }) => {
    if (state.kills.length >= 5) {
      state.kills.shift();
    }

    state.kills.push({ username, killerUsername, createdAt: Date.now() });
    dispatch({ kills: state.kills });
  };

  return (
    <div className={styles.kills}>
      { state.kills.map((k, i, a) => (
        <div
          key={k.createdAt}
          className={styles.kill}
          style={{
            opacity: 1 - ((a.length - (i + 1)) * 0.2),
          }}
        >
          <strong>
            { k.killerUsername === username ? 'you' : k.killerUsername }
          </strong>
          <span> killed </span>
          <strong>{ k.username === username ? 'you' : k.username }</strong>
        </div>
      ))}
    </div>
  );
};
