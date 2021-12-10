const { spawn } = require('child_process');

spawn('webpack', [
  'serve', '--config', './webpack.config.js',
], { stdio: [0, 1, 2] });

spawn('nodemon', [
  '--watch', './server',
  '--exec', 'node', './server/index.js',
], { stdio: [0, 1, 2] });
