const sendMessage = req => {
  req.broadcast('messenger', {
    sender: req.data.sender,
    message: req.data.message,
  });
};

module.exports = {
  routes: {
    messenger: sendMessage,
  },
};
