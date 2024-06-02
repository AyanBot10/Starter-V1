const express = require('express');
const os = require('os');

const app = express();
const { port } = global.config.server;

app.get('*', (req, res) => {
  const systemInfo = {
    platform: os.platform(),
    arch: os.arch(),
    cpu: os.cpus(),
    memory: {
      total: os.totalmem(),
      free: os.freemem()
    },
    uptime: os.uptime(),
    loadAvg: os.loadavg(),
    networkInterfaces: os.networkInterfaces(),
    userInfo: os.userInfo()
  };

  const globalInfo = {
    globalKeys: Object.keys(global)
  };

  const response = {
    systemInfo,
    globalInfo,
    timestamp: new Date().toISOString()
  };

  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(response, null, 2));
});

app.listen(port, () => {
  global.log("Successfully Started Server at Port " + port, "cyan", true)
});

module.exports = app;