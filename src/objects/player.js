import { Events, GameObjects, Input, Math as PMath } from 'phaser';

import { PLAYER_SPEED } from '../utils/settings';

import charset from '../assets/images/charset.png';

export default class Player extends GameObjects.Sprite {
  events = new Events.EventEmitter();
  #canMove = true;
  #life = 100;
  #maxLife = 100;
  #previousRender = {};

  constructor (scene, ...args) {
    super(scene, ...args);

    scene.load.spritesheet('player', charset, {
      frameWidth: 64,
      frameHeight: 128,
    });
  }

  create () {
    this.setTexture('player', 0);
    this.scene.physics.add.existing(this);
    this.scene.add.existing(this);
    this.setDepth(10000);

    // Init keys
    this.scene.cursors = this.scene.input.keyboard.createCursorKeys();
    ['z', 'q', 's', 'd'].forEach(k => {
      this.scene.cursors[k] = this.scene.input.keyboard
        .addKey(Input.Keyboard.KeyCodes[k.toUpperCase()]);
    });

    this.#previousRender = { x: this.x, y: this.y, angle: this.pointerAngle };
  }

  update () {
    this.move();
    this.determinePointerAngle();

    if (this.shouldSendUpdate()) {
      this.scene.server.send('player-move', {
        x: this.x,
        y: this.y,
        angle: this.pointerAngle,
      }, { zone: this.map.id });
    }

    this.#previousRender = { x: this.x, y: this.y, angle: this.pointerAngle };
  }

  determinePointerAngle () {
    this.pointerAngle = PMath.Angle.Between(
      this.x,
      this.y,
      this.scene.input.activePointer.worldX,
      this.scene.input.activePointer.worldY,
    );
    this.pointerAngleDeg = PMath.RadToDeg(this.pointerAngle);
    this.setRotation(this.pointerAngle);
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
  }

  shouldSendUpdate () {
    const { x, y, angle } = this.#previousRender;

    return (
      this.x !== x ||
      this.y !== y ||
      this.pointerAngle !== angle
    );
  }

  getLife () {
    return this.#life;
  }

  getMaxLife () {
    return this.#maxLife;
  }
}
