import { GameObjects, Math as PMath } from 'phaser';

import Bullets from './bullets';

class Enemy extends GameObjects.Sprite {
  constructor (scene, id, x, y) {
    super(scene, x, y, 'charset', 0);
    this.id = id;

    this.bullets = new Bullets(scene, this);
  }

  create () {
    this.scene.add.existing(this);
    this.scene.physics.add.existing(this);
    this.body.setSize(64, 64);
    this.setScale(0.5);

    this.bullets.init();
    this.bullets.addCollider(this.scene.player);

    return this;
  }

  fire (angle) {
    this.bullets.fire(PMath.RadToDeg(angle - (Math.PI / 2)));
  }
}

export default class Enemies {
  constructor (scene, player, map) {
    this.scene = scene;
    this.player = player;
    this.map = map;
  }

  create () {
    this.enemies = this.scene.add.group().setDepth(this.player.depth + 1);

    this.scene.server.once('map-players', ({ players } = {}) => {
      players.forEach(e => this.addEnemy(e));
    });

    this.scene.server.on('player-init', enemy => {
      this.addEnemy(enemy);
    });

    this.scene.server.on('player-move', ({ id, x, y, angle }) => {
      const enemy = this.enemies.getMatching('id', id)[0];
      enemy.setPosition(x, y);
      enemy.setRotation(angle);
    });

    this.scene.server.on('player-shoot', ({ id, x, y, angle }) => {
      const enemy = this.enemies.getMatching('id', id)[0];
      enemy.setPosition(x, y);
      enemy.setRotation(angle);
      enemy.fire(angle);
    });

    this.scene.server.on('player-disconnect', ({ id }) => {
      this.enemies.getMatching('id', id)[0]?.destroy();
    });

    this.scene.server.on('player-dead', ({ id }) => {
      this.enemies.getMatching('id', id)[0]?.destroy();
    });

    this.scene.server.on('player-killed', ({ id }) => {
      this.enemies.getMatching('id', id)[0]?.destroy();
    });

    this.scene.physics.add
      .overlap(this.enemies, this.player.bullets, (enemy, bullet) => {
        if (!bullet.active) return;
        this.scene.server.send('player-hit', {
          id: enemy.id,
          damage: bullet.damage,
        }, { zone: this.map.id });
        bullet.destroy();
      });
  }

  addEnemy ({ id, x, y }) {
    const enemy = new Enemy(this.scene, id, x, y);
    enemy.create().setDepth(this.player.depth + 1);
    this.enemies.add(enemy);
  }
}
