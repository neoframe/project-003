import { Animations, Events, GameObjects, Input, Math as PMath } from 'phaser';

import { PLAYER_SPEED } from '../utils/settings';
// import Weapon from './weapon';
// import charset from '../assets/images/charset.png';

export default class Player extends GameObjects.Sprite {
  static WIDTH = 32;
  static HEIGHT = 64;
  static FRAMES = {
    IDLE: {
      RIGHT: [56, 61],
      TOP: [62, 67],
      LEFT: [68, 73],
      BOTTOM: [74, 79],
    },
    WALK: {
      RIGHT: [112, 117],
      TOP: [118, 123],
      LEFT: [124, 129],
      BOTTOM: [130, 135],
    },
    STAB: {
      RIGHT: [840, 845],
      TOP: [846, 851],
      LEFT: [852, 857],
      BOTTOM: [858, 863],
      repeat: 0,
      frameRate: 15,
    },
  };

  events = new Events.EventEmitter();
  direction = 'bottom';
  #canMove = true;
  #dead = false;
  #money = 0;
  #life = 100;
  #maxLife = 100;
  #mana = 100;
  #maxMana = 100;
  #flags = [];

  constructor (scene, ...args) {
    super(scene, ...args);

    // scene.load
    //   .spritesheet('player', charset, { frameWidth: 32, frameHeight: 64 });
  }

  create () {
    // this.setTexture('player', Player.FRAMES.IDLE.BOTTOM[0]);
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
    if (!this.#canMove || this.attacking) {
      this.body.setVelocity(0, 0);

      return;
    }

    if (this.scene.cursors.left.isDown || this.scene.cursors.q.isDown) {
      this.body.setVelocityX(-PLAYER_SPEED);
      this.direction = 'left';
    } else if (
      this.scene.cursors.right.isDown ||
      this.scene.cursors.d.isDown
    ) {
      this.body.setVelocityX(PLAYER_SPEED);
      this.direction = 'right';
    } else {
      this.body.setVelocityX(0);
    }

    if (this.scene.cursors.up.isDown || this.scene.cursors.z.isDown) {
      this.body.setVelocityY(-PLAYER_SPEED);
      this.direction = 'top';
    } else if (
      this.scene.cursors.down.isDown ||
      this.scene.cursors.s.isDown
    ) {
      this.body.setVelocityY(PLAYER_SPEED);
      this.direction = 'bottom';
    } else {
      this.body.setVelocityY(0);
    }
  }

  getAnimationName () {
    const { x, y } = this.body.velocity;

    if (this.attacking) {
      return `player-stab-${this.direction}`;
    } else if (x === 0 && y === 0) {
      return `player-idle-${this.direction}`;
    } else {
      return `player-walk-${this.direction}`;
    }
  }

  setAnimation () {
    const animationName = this.getAnimationName();

    if (animationName !== this.anims.getName()) {
      this.anims.play(animationName, true);
    }
  }

  onAttack () {
    if (this.attacking || this.isDead()) {
      return;
    }

    this.attacking = true;

    const enemy = this.map?.enemies.getChildren().find(e =>
      PMath.Distance.Between(e.x, e.y, this.x, this.y) < 50);

    if (enemy && !enemy.isDead()) {
      const angle = PMath.Angle.Between(this.x, this.y, enemy.x, enemy.y);
      this.scene.matter.applyForceFromAngle(enemy, 100, angle);
      enemy.damage(Weapon.DPS);
    }

    this.once(
      Animations.Events.ANIMATION_COMPLETE, this.onAttackComplete, this);
    this.weapon.attack(this.direction);
  }

  damage (dps) {
    if (this.isDead()) {
      return;
    }

    this.#life = Math.max(0, this.#life - dps);

    if (!this.#life) {
      this.die();
    }
  }

  onAttackComplete () {
    this.attacking = false;
  }

  onUILock () {
    this.#canMove = false;
  }

  onUIUnlock () {
    this.#canMove = true;
  }

  getMoney () {
    return this.#money;
  }

  addMoney (amount = 0) {
    this.#money += amount;
  }

  getLife () {
    return this.#life;
  }

  getMaxLife () {
    return this.#maxLife;
  }

  getMana () {
    return this.#mana;
  }

  getMaxMana () {
    return this.#maxMana;
  }

  hasFlag (flag) {
    return this.#flags.includes(flag);
  }

  addFlag (flag) {
    if (!this.hasFlag(flag)) {
      this.#flags.push(flag);
    }
  }

  isDead () {
    return this.#dead;
  }

  die () {
    this.#dead = true;
    this.#canMove = false;
    this.scene.matter.pause(this.body);
    this.events.emit('die');
  }

  onRevive () {
    this.#canMove = true;
    this.scene.matter.resume(this.body);

    if (!this.#dead) {
      return;
    }

    this.#dead = false;
    this.#life = this.#maxLife;
  }

  destroy () {
    super.destroy();
  }
}
