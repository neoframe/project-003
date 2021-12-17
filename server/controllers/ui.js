const sendMessage = req => {
  req.broadcast('messenger', {
    sender: req.data.sender,
    message: req.data.message,
  });
};

const getLeaderboard = req => {
  const players = req.stores.players.zone(req).getAll();

  req.send('leaderboard', {
    players: players.map(([id, player]) => ({
      id,
      username: player.username,
      kills: player.kills || 0,
      deaths: player.deaths || 0,
    })).sort((a, b) =>
      (b.deaths > 0 ? b.kills / b.deaths : b.kills) -
      (a.deaths > 0 ? a.kills / a.deaths : a.kills)
    ),
  });
};

module.exports = {
  routes: {
    messenger: sendMessage,
    leaderboard: getLeaderboard,
  },
};
