const initPlayer = req => {
  req.stores.players.zone(req).patch(req.client.id, {
    moving: false,
    angle: 0,
    x: req.data.x,
    y: req.data.y,
    username: req.data.username,
  });

  req.send('map-players', {
    players: req.stores.players.zone(req).getAll()
      .filter(([id]) => id !== req.client.id)
      .map(([id, p]) => ({
        id,
        username: p.username,
        x: p.x,
        y: p.y,
        angle: p.angle,
      })),
  });

  req.broadcast('player-init', {
    id: req.client.id,
    x: req.data.x,
    y: req.data.y,
    username: req.data.username,
  });
};

const movePlayer = req => {
  req.stores.players.zone(req).patch(req.client.id, {
    moving: true,
    angle: req.data.angle,
    x: req.data.x,
    y: req.data.y,
  });

  req.broadcast('player-move', {
    id: req.client.id,
    angle: req.data.angle,
    x: req.data.x,
    y: req.data.y,
  });
};

const stopPlayer = req => {
  req.stores.players.zone(req).patch(req.client.id, {
    moving: false,
  });

  req.broadcast('player-stop', {
    id: req.client.id,
  });
};

const removePlayer = req => {
  req.stores.players.zone(req)
    .delete(req.client.id, { zone: req.client.zone });

  req.broadcast('player-disconnect', {
    id: req.client.id,
  });
};

module.exports = {
  routes: {
    'player-init': initPlayer,
    'player-move': movePlayer,
    'player-stop': stopPlayer,
  },
  on: {
    disconnect: removePlayer,
  },
};
