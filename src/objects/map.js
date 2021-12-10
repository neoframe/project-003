import { Events } from 'phaser';

import * as tilesets from '../assets/images';
import * as maps from '../assets/maps';

export default class Map {
  events = new Events.EventEmitter();
  tilesets = [];
  layers = [];
  obstacles = [];
  actions = [];
  startPositions = [];
  playerDepth = 0;

  constructor (scene, player) {
    this.scene = scene;
    this.player = player;
    this.player.map = this;

    Object.entries(tilesets).forEach(([k, v]) => {
      scene.load.image(`tileset-${k}`, v);
    });

    Object.entries(maps).forEach(([k, v]) => {
      scene.load.tilemapTiledJSON(`map-${k}`, v);
    });
  }

  create () {}

  reset () {
    // [...this.obstacles, ...this.actions]
    //   .forEach(o => o.destroy());
    this.tilemap?.destroy();
    this.tilesets = [];
    this.layers = [];
    this.obstacles = [];
    this.actions = [];
    this.startPositions = [];
  }

  init (mapId, options = {}) {
    this.reset();
    this.id = mapId;
    this.tilemap = this.scene.add.tilemap(`map-${mapId}`, 0, 0);

    // Init tilesets
    this.tilemap.tilesets.forEach(tileset => {
      this.tilesets.push(this.tilemap
        .addTilesetImage(tileset.name, `tileset-${tileset.name}`));
    });

    // Init layers
    this.tilemap.layers.forEach(l => {
      const layer = this.tilemap
        .createLayer(l.name, this.tilesets, 0, 0)
        .setDepth(this.getProperty(l.properties, 'depth'));
      this.initCollisions(layer, options);

      this.layers.push(layer);
    });

    this.tilemap.objects?.forEach(layer => {
      layer.objects.forEach(obj => {
        this.initActions(layer, obj, options);
        this.initPlayerProps(layer, obj, options);
      });
    });

    this.scene.physics.world.setBounds(0, 0, this.getWidth(), this.getHeight());

    this.events.emit('startPosition',
      this.startPositions.find(s => s.source === options.from) ||
      this.startPositions.find(s => s.source === 'default') ||
      { x: this.getWidth() / 2, y: this.getHeight() / 2 });
  }

  initCollisions (layer) {
    if (
      this.getProperty(layer.layer.properties, 'collides') === true
    ) {
      layer.setCollisionByExclusion([-1]);
      this.scene.physics.add.collider(this.player, layer);
      this.obstacles.push(layer);
    }
  }

  initActions (layer, obj) {
    if (this.getProperty(obj.properties, 'action') === true) {
      let props = {};

      if (this.getProperty(obj.properties, 'goTo')) {
        props = {
          isSensor: true,
          onCollideCallback: () => {
            this.events.emit('goTo', this.getProperty(obj.properties, 'goTo'));
          },
        };
      }

      this.actions.push(this.createObject(obj, props));
    }
  }

  initPlayerProps (layer, obj, options) {
    if (this.getProperty(obj.properties, 'player') === true) {
      this.playerDepth = this.getProperty(layer.properties, 'depth');
    }

    const startPosition = this.getProperty(obj.properties, 'start');

    if (startPosition && startPosition === options.from) {
      this.startPositions.push({ source: startPosition, x: obj.x, y: obj.y });
    } else if (startPosition === true) {
      this.startPositions.push({ source: 'default', x: obj.x, y: obj.y });
    }
  }

  createObject (obj, props = {}) {
    // const center = this.getCenter(obj);

    // if (obj.rectangle) {
    //   return this.scene.matter.add
    //     .rectangle(obj.x + center.x, obj.y + center.y, obj.width, obj.height, {
    //       ignoreGravity: true,
    //       isStatic: true,
    //       ...props,
    //     });
    // } else if (obj.polygon) {
    //   return this.scene.matter.add
    //     .fromVertices(obj.x + center.x, obj.y + center.y, obj.polygon, {
    //       ignoreGravity: true,
    //       isStatic: true,
    //       ...props,
    //     });
    // }
  }

  getCenter (obj) {
    if (obj.rectangle) {
      return { x: obj.width / 2, y: obj.height / 2 };
    } else if (obj.polygon) {
      const x = obj.polygon.map(p => p.x);
      const y = obj.polygon.map(p => p.y);

      return {
        x: (Math.min(...x) + Math.max(...x)) / 2,
        y: (Math.min(...y) + Math.max(...y)) / 2,
      };
    }
  }

  getProperty (props = [], name) {
    return (Array.isArray(props) ? props : [])
      .find(p => p.name === name)?.value;
  }

  hasProperty (props = [], name) {
    return (Array.isArray(props) ? props : []).some(p => p.name === name);
  }

  getPlayerDepth () {
    return this.playerDepth;
  }

  getWidth () {
    return this.tilemap.widthInPixels;
  }

  getHeight () {
    return this.tilemap.heightInPixels;
  }

  hasMap (mapId) {
    return !!maps[mapId];
  }
}
