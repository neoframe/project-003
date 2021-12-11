import { GameObjects, Physics } from 'phaser';

import bullet from '../assets/images/bullet.png';

class Bullet extends GameObjects.Sprite {
  damage = 20;

  fire (angle) {
    this.setActive(true)
      .setVisible(true)
      .setAngle(angle);

    this.scene.physics.velocityFromAngle(angle, 1000, this.body.velocity);
    this.anims.play('bullet-anim', true);

    this.body.setCollideWorldBounds(true);
    this.body.onWorldBounds = true;
    this.body.world.on('worldbounds', body => {
      if (!body.gameObject.active) return;
      body.setVelocity(0, 0);
      body.allowGravity = false;
      body.gameObject.destroy();
    });

    return this;
  }
}

export default class Bullets extends Physics.Arcade.Group {
  constructor (scene, owner, { threshold = 100 } = {}) {
    super(scene.physics.world, scene);
    this.owner = owner;
    this.threshold = threshold;

    scene.load.spritesheet('bullet', bullet, { frameWidth: 8, frameHeight: 8 });
  }

  init () {
    this.scene.anims.create({
      key: 'bullet-anim',
      frames: this.scene.anims
        .generateFrameNumbers('bullet', { start: 0, end: 6 }),
      frameRate: 20,
      repeat: 0,
      skipMissedFrames: false,
    });

    this.createMultiple({
      frameQuantity: 100,
      key: 'bullet',
      frame: 0,
      active: false,
      visible: false,
      classType: Bullet,
    });
  }

  addCollider (collider) {
    this.scene.physics.add.collider(this, collider, (bullet, player) => {
      (bullet instanceof Bullet ? bullet : player).destroy();
    });
  }

  fire (angle) {
    const bullet = this.getFirstDead(false);
    if (!bullet) return;
    bullet
      .setPosition(this.owner.x, this.owner.y)
      .setDepth(this.owner.depth + 1)
      .fire(angle);
  }
}
