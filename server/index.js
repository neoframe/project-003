const Server = require('./utils/server');
const players = require('./controllers/players');

(new Server())
  .addStore('players')
  .addController(players)
  .start({ port: 21003 });
