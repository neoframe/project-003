const Server = require('./utils/server');
const players = require('./controllers/players');
const ui = require('./controllers/ui');

const ws = new Server({
  port: 21003,
  debug: true,
  name: 'Main server',
});

ws
  .addStore('players')
  .addController(players)
  .addController(ui)
  .start();
