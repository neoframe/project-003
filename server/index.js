const Server = require('./utils/server');
const players = require('./controllers/players');
const messenger = require('./controllers/messenger');

const ws = new Server({
  port: 21003,
  debug: true,
  name: 'Main server',
});

ws
  .addStore('players')
  .addController(players)
  .addController(messenger)
  .start();
