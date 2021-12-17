import ReactDOM from 'react-dom';
import { createRef } from 'react';
import { Scene } from 'phaser';

import Messenger from '../ui/Messenger';
import Kills from '../ui/Kills';
import Leaderboard from '../ui/Leaderboard';

export default class HUD extends Scene {
  constructor () {
    super({ key: 'HUDScene' });
  }

  create () {
    this.server = this.scene.get('MainScene').server;
    this.username = this.scene.get('MainScene').username;

    this.messenger = this.add
      .dom(20, this.cameras.main.height - 20, 'div',
        'width: 500px; height: 200px;')
      .setDepth(10000).setOrigin(0, 1);

    ReactDOM.render((
      <Messenger
        server={this.server}
        username={this.username}
        onFocus={this.onMessengerFocus.bind(this)}
        onBlur={this.onMessengerBlur.bind(this)}
      />
    ), this.messenger.node);

    this.kills = this.add
      .dom(20, this.cameras.main.height / 2,
        'div', 'width: 500px; height: 300px; pointer-events: none;')
      .setDepth(10000).setOrigin(0, 1);

    ReactDOM.render((
      <Kills server={this.server} username={this.username} />
    ), this.kills.node);

    this.leaderboard = this.add
      .dom(this.cameras.main.centerX, 20, 'div', 'width: 500px; height: 300px;')
      .setDepth(10000).setOrigin(0.5, 0);

    const leaderboardRef = createRef();

    ReactDOM.render((
      <Leaderboard
        ref={leaderboardRef}
        server={this.server}
        username={this.username}
      />
    ), this.leaderboard.node);

    this.input.keyboard.on('keydown-TAB', e => {
      e.preventDefault();
      this.server.send('leaderboard');
      leaderboardRef.current.show();
    });

    this.input.keyboard.on('keyup-TAB', e => {
      e.preventDefault();
      leaderboardRef.current.hide();
    });
  }

  update () {
    this.messenger.setPosition(20, this.cameras.main.height - 20);
    this.kills.setPosition(20, this.cameras.main.height / 2);
  }

  destroy () {
    ReactDOM.unmountComponentAtNode(this.messenger.node);
    ReactDOM.unmountComponentAtNode(this.kills.node);
  }

  onMessengerFocus () {
    this.scene.get('MainScene').input.keyboard.disableGlobalCapture();
    this.game.events.emit('messenger-focus');
  }

  onMessengerBlur () {
    this.scene.get('MainScene').input.keyboard.enableGlobalCapture();
    this.game.events.emit('messenger-blur');
  }
}
