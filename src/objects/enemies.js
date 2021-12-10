export default class Enemies {
  constructor (scene, player, map) {
    this.scene = scene;
    this.player = player;
    this.map = map;
  }

  create () {
    this.enemies = this.scene.add.group();

    this.scene.server.once('map-players', ({ players } = {}) => {
      players.forEach(e => this.addEnemy(e));
    });

    this.scene.server.on('player-init', enemy => {
      this.addEnemy(enemy);
    });

    this.scene.server.on('player-move', ({ id, x, y }) => {
      const enemy_ = this.enemies.getMatching('id', id)[0];
      enemy_.setPosition(x, y);
    });

    this.scene.server.on('player-disconnect', ({ id }) => {
      this.enemies.getMatching('id', id)[0]?.destroy();
    });
  }

  addEnemy ({ id, x, y }) {
    const enemy_ = this.scene.add.sprite(x, y, 'player');
    enemy_.id = id;
    this.enemies.add(enemy_);
  }
}
