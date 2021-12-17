import ReactDOM from 'react-dom';
import { Scene } from 'phaser';

import Messenger from '../components/Messenger';

export default class HUD extends Scene {
  constructor () {
    super({ key: 'HUDScene' });
  }

  create () {
    this.messenger = this.add
      .dom(20, this.cameras.main.height - 20, 'div',
        'width: 500px; height: 200px;')
      .setDepth(10000).setOrigin(0, 1);

    ReactDOM.render((
      <Messenger
        server={this.scene.get('MainScene').server}
        username={this.scene.get('MainScene').username}
        onFocus={this.onMessengerFocus.bind(this)}
        onBlur={this.onMessengerBlur.bind(this)}
      />
    ), this.messenger.node);
  }

  update () {
    this.messenger.setPosition(20, this.cameras.main.height - 20);
  }

  destroy () {
    ReactDOM.unmountComponentAtNode(this.messenger.node);
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
