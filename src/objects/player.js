import { Events, GameObjects, Input } from 'phaser';

import { PLAYER_SPEED } from '../utils/settings';

export default class Player extends GameObjects.Sprite {
  events = new Events.EventEmitter();
  #canMove = true;
  #life = 100;
  #maxLife = 100;

  create () {
    this.setSize(32, 64);
    this.scene.physics.add.existing(this);
    this.scene.add.existing(this);

    // Init keys
    this.scene.cursors = this.scene.input.keyboard.createCursorKeys();
    ['z', 'q', 's', 'd'].forEach(k => {
      this.scene.cursors[k] = this.scene.input.keyboard
        .addKey(Input.Keyboard.KeyCodes[k.toUpperCase()]);
    });

  }

  update () {
    this.move();
  }

  move () {
    if (!this.#canMove) {
      this.body.setVelocity(0, 0);

      return;
    }

    if (this.scene.cursors.left.isDown || this.scene.cursors.q.isDown) {
      this.body.setVelocityX(-PLAYER_SPEED);
    } else if (
      this.scene.cursors.right.isDown ||
      this.scene.cursors.d.isDown
    ) {
      this.body.setVelocityX(PLAYER_SPEED);
    } else {
      this.body.setVelocityX(0);
    }

    if (this.scene.cursors.up.isDown || this.scene.cursors.z.isDown) {
      this.body.setVelocityY(-PLAYER_SPEED);
    } else if (
      this.scene.cursors.down.isDown ||
      this.scene.cursors.s.isDown
    ) {
      this.body.setVelocityY(PLAYER_SPEED);
    } else {
      this.body.setVelocityY(0);
    }

    if (this.body.velocity.x !== 0 || this.body.velocity.y !== 0) {
      this.scene.server.send('player-move', {
        x: this.x,
        y: this.y,
      }, { zone: this.map.id });
    }
  }

  getLife () {
    return this.#life;
  }

  getMaxLife () {
    return this.#maxLife;
  }
}
