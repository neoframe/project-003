import { forwardRef, useImperativeHandle, useEffect, useReducer } from 'react';
import { mockState } from '@poool/junipero-utils';

import styles from './index.module.sass';

export default forwardRef(({ server }, ref) => {
  const [state, dispatch] = useReducer(mockState, {
    players: [],
    active: false,
  });

  useEffect(() => {
    server.on('leaderboard', onLeaderboard);

    return () => {
      server.off('leaderboard', onLeaderboard);
    };
  }, []);

  useImperativeHandle(ref, () => ({
    show: () => !state.active && dispatch({ active: true }),
    hide: () => dispatch({ active: false }),
  }));

  const onLeaderboard = ({ players }) => {
    dispatch({ players });
  };

  return state.active && (
    <div className={styles.leaderboard}>
      <table>
        <thead>
          <tr>
            <th>Username</th>
            <th>Kills</th>
            <th>Deaths</th>
          </tr>
        </thead>
        <tbody>
          { state.players.map(player => (
            <tr key={player.id}>
              <td>{ player.username }</td>
              <td>{ player.kills }</td>
              <td>{ player.deaths }</td>
            </tr>
          )) }
        </tbody>
      </table>
    </div>
  );
});
