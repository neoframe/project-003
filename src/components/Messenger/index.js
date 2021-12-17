import { useReducer, useRef, useEffect } from 'react';
import { classNames, mockState } from '@poool/junipero-utils';
import { v4 as uuid } from 'uuid';

import styles from './index.module.sass';

export default ({ username, server, onFocus, onBlur }) => {
  const messagesListRef = useRef();
  const inputRef = useRef();
  const [state, dispatch] = useReducer(mockState, {
    messages: [],
    input: '',
    focused: false,
    nonce: uuid(),
  });

  useEffect(() => {
    server.on('messenger', onMessage);

    return () => {
      server.off('messenger', onMessage);
    };
  }, []);

  useEffect(() => {
    messagesListRef.current.scrollTop =
      messagesListRef.current.scrollHeight + 200;
  }, [state.nonce]);

  const onMessage = ({ sender, message }) => {
    if (state.messages.length > 100) {
      state.messages.shift();
    }

    state.messages.push({ sender, message });
    dispatch({ messages: state.messages, nonce: uuid() });
  };

  const sendMessage = e => {
    e.preventDefault();

    if (state.input.length > 0) {
      server.send('messenger', { sender: username, message: state.input });
      onMessage({ sender: username, message: state.input });
      dispatch({ input: '' });
      inputRef.current.blur();
    }
  };

  const onChange = e => {
    dispatch({ input: e.target.value });
  };

  const onFocus_ = e => {
    dispatch({ focused: true });
    onFocus?.(e);
  };

  const onBlur_ = e => {
    dispatch({ focused: false });
    onBlur?.(e);
  };

  return (
    <div
      className={classNames(
        styles.messenger,
        { [styles.focused]: state.focused }
      )}
    >
      <div ref={messagesListRef} className={styles.messages}>
        { state.messages.map(({ sender, message }) => (
          <div key={sender + message} className={styles.message}>
            <strong>{ sender }: </strong>
            <span>{ message }</span>
          </div>
        )) }
      </div>
      <form className={styles.form} onSubmit={sendMessage}>
        <input
          type="text"
          ref={inputRef}
          value={state.input}
          onChange={onChange}
          onFocus={onFocus_}
          onBlur={onBlur_}
          placeholder="Type your message..."
        />
      </form>
    </div>
  );
};
