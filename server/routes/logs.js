const router = require("express").Router;

router.get("/", (req, res) => {
  const response = {
    status: true,
    logs: [...global.server.logs]
  };
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(response, null, 2));
});

module.exports = router;