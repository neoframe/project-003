const Server = require('./utils/server');
const players = require('./controllers/players');

(new Server({ port: 21003, debug: true }))
  .addStore('players')
  .addController(players)
  .start();
