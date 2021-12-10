import WebSocketServer from './server';

export default class WebSocketPlugin {
  static register (manager) {
    manager.register(
      'WebSocketPlugin',
      WebSocketPlugin,
      'webSocketPlugin'
    );
  }

  constructor (scene) {
    this.scene = scene;
    this.sys = scene.sys;
    this.servers = [];
  }

  add (url) {
    const server = new WebSocketServer(this.scene, url);
    this.servers.push(server);

    return server;
  }
}
