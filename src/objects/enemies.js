import { GameObjects, Math as PMath } from 'phaser';

import Bullets from './bullets';

class Enemy extends GameObjects.Sprite {
  constructor (scene, map, id, x, y) {
    super(scene, x, y, 'charset', 0);
    this.map = map;
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
    this.bullets.addCollider(this.map.obstacles);

    return this;
  }

  fire (angle) {
    this.bullets.fire(PMath.RadToDeg(angle - (Math.PI / 2)));
  }

  destroy () {
    this.bullets.destroy();
    super.destroy();
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

    this.scene.server.once('map-players', this.onReady, this);
    this.scene.server.on('player-init', this.onAddPlayer, this);
    this.scene.server.on('player-move', this.onMove, this);
    this.scene.server.on('player-shoot', this.onShoot, this);
    this.scene.server.on('player-disconnect', this.onRemovePlayer, this);
    this.scene.server.on('player-killed', this.onRemovePlayer, this);

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

  onReady ({ players }) {
    players.forEach(e => this.onAddPlayer(e));
  }

  onAddPlayer ({ id, x, y }) {
    const enemy = new Enemy(this.scene, this.map, id, x, y);
    enemy.create().setDepth(this.player.depth + 1);
    this.enemies.add(enemy);
  }

  onMove ({ id, x, y, angle }) {
    const enemy = this.enemies.getMatching('id', id)[0];
    if (!enemy) return;
    enemy.setPosition(x, y);
    enemy.setRotation(angle);
  }

  onShoot ({ id, x, y, angle }) {
    const enemy = this.enemies.getMatching('id', id)[0];
    if (!enemy) return;
    enemy.setPosition(x, y);
    enemy.setRotation(angle);
    enemy.fire(angle);
  }

  onRemovePlayer ({ id }) {
    const enemy = this.enemies.getMatching('id', id)[0];
    if (!enemy) return;
    this.enemies.remove(enemy);
    enemy.destroy();
  }

  destroy () {
    this.scene.server.off('map-players', this.onReady, this);
    this.scene.server.off('player-init', this.onAddPlayer, this);
    this.scene.server.off('player-move', this.onMove, this);
    this.scene.server.off('player-shoot', this.onShoot, this);
    this.scene.server.off('player-disconnect', this.onRemovePlayer, this);
    this.scene.server.off('player-killed', this.onRemovePlayer, this);

    this.enemies.clear(true, true);
    this.enemies.destroy();
  }
}
