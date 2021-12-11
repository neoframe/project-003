import { Scene, Cameras } from 'phaser';

import { SERVER_URL, ZOOM } from '../utils/settings';
import Map from '../objects/map';
import Player from '../objects/player';
import Enemies from '../objects/enemies';

export default class MainScene extends Scene {
  constructor () {
    super({ key: 'MainScene' });
    this.username = globalThis.sessionStorage.getItem('username') ||
      globalThis.localStorage.getItem('username');
  }

  preload () {
    this.player = new Player(this);
    this.map = new Map(this, this.player);
    this.enemies = new Enemies(this, this.player, this.map);
  }

  create () {
    this.server = this.webSocket.add(SERVER_URL);
    this.player.create();

    this.cameras.main.startFollow(this.player, false).setZoom(ZOOM);

    this.map.create();
    this.enemies.create();

    this.map.events.once('startPosition', ({ x, y }) => {
      this.player.setPosition(x, y);
    });

    this.map.init('dust');
    this.onMapReady();
  }

  update () {
    this.player.update();
  }

  onMapReady () {
    this.player.setDepth(this.map.getPlayerDepth() || Infinity);
    this.cameras.main
      .setBounds(0, 0, this.map.getWidth(), this.map.getHeight());

    this.player.onMapReady();

    this.map.events.once('goTo', mapId => {
      if (this.map.hasMap(mapId)) {
        this.goTo(mapId);
      }
    });

    this.cameras.main.fadeIn(500);
    this.cameras.main.once(Cameras.Scene2D.Events.FADE_IN_COMPLETE, () => {
      this.events.emit('mapready');
    });
  }

  goTo (mapId, { ignoreFrom = false } = {}) {
    this.map.events.once('startPosition', ({ x, y }) => {
      this.player.setPosition(x, y);
    });

    this.cameras.main.fadeOut(500);
    this.cameras.main.once(Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.map.init(mapId, { from: !ignoreFrom && this.map.id });
      this.onMapReady();
    });
  }
}
