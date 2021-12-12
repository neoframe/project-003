const Server = require('./utils/server');
const players = require('./controllers/players');

const ws = new Server({
  port: 21003,
  debug: true,
  name: 'Main server',
});

ws
  .addStore('players')
  .addController(players)
  .start();
