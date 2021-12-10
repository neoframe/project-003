import { render } from 'react-dom';
import { useRef, useState } from 'react';

import Game from './objects/game';

import './index.sass';

const App = () => {
  const inputRef = useRef();
  const [ready, setReady] = useState(false);

  const onSubmit = e => {
    e.preventDefault();

    globalThis.sessionStorage.setItem('username', inputRef.current.value);
    globalThis.localStorage.setItem('username', inputRef.current.value);

    setReady(true);
    Game();
  };

  return !ready && (
    <div className="app">
      <form onSubmit={onSubmit} className="login-form">
        <input
          value={
            globalThis.sessionStorage.getItem('username') ||
            globalThis.localStorage.getItem('username')
          }
          ref={inputRef}
          type="text"
          placeholder="USERNAME"
        />
        <button type="submit">PLAY</button>
      </form>
    </div>
  );
};

render(<App />, document.getElementById('app'));
