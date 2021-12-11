import { Events, GameObjects, Input, Math as PMath } from 'phaser';

import { PLAYER_SPEED } from '../utils/settings';
import Bullets from './bullets';

import charset from '../assets/images/charset.png';

export default class Player extends GameObjects.Sprite {
  events = new Events.EventEmitter();
  #canMove = true;
  #life = 100;
  #maxLife = 100;
  #previousRender = {};

  constructor (scene, ...args) {
    super(scene, ...args);

    this.bullets = new Bullets(scene, this);

    scene.load.spritesheet('charset', charset, {
      frameWidth: 64,
      frameHeight: 128,
    });
  }

  create () {
    this.setTexture('charset', 0);
    this.scene.physics.add.existing(this);
    this.scene.add.existing(this);
    this.body.setSize(64, 64);
    this.setScale(0.5);

    this.scene.input.setPollAlways();

    // Init keys
    this.scene.cursors = this.scene.input.keyboard.createCursorKeys();
    ['z', 'q', 's', 'd'].forEach(k => {
      this.scene.cursors[k] = this.scene.input.keyboard
        .addKey(Input.Keyboard.KeyCodes[k.toUpperCase()]);
    });

    this.scene.input.on('pointerdown', this.fire, this);
    this.bullets.init();

    // Init anims
    this.anims.create({
      key: 'player-walking',
      frames: this.anims.generateFrameNumbers('charset', {
        start: 1,
        end: 3,
      }),
      frameRate: 5,
      repeat: -1,
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

  onMapReady () {
    this.bullets.addCollider(this.map.obstacles);
    this.scene.server.send('player-init', {
      username: this.scene.username,
      x: this.x,
      y: this.y,
      life: this.#life,
    }, { zone: this.map.id });
  }

  determinePointerAngle (pointer) {
    pointer = pointer || this.scene.input.activePointer;
    pointer.updateWorldPoint(this.scene.cameras.main);

    this.pointerAngle = PMath.Angle.Between(
      this.x,
      this.y,
      pointer.worldX,
      pointer.worldY,
    ) + (Math.PI / 2);

    this.pointerAngleDeg = PMath.RadToDeg(this.pointerAngle) - 90;
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

    if (this.isMoving()) {
      this.anims.play('player-walking', true);
    } else {
      this.anims.stop();
      this.setTexture('charset', 0);
    }
  }

  isMoving () {
    return this.body.velocity.x !== 0 || this.body.velocity.y !== 0;
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

  fire () {
    this.scene.server.send('player-shoot', {}, { zone: this.map.id });
    this.bullets.fire(this.pointerAngleDeg);
  }
}
