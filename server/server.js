const WebSocket = require('ws');
const express = require('express');
const path = require('path');
const os = require('os');

const app = express();
const server = app.listen(8090, () => {
  const interfaces = os.networkInterfaces();
  const wifiInterface = Object.entries(interfaces)
    .flatMap(([name, ifaceList]) => ifaceList.map((iface) => ({ name, ...iface })))
    .find((iface) => iface.family === 'IPv4' && !iface.internal && iface.name.toLowerCase().includes('wi-fi'));
  const localIp = wifiInterface?.address;

  if (localIp) {
    console.log(`IP Server: ${localIp}`);
  }
  import('open').then((open) => open.default('http://localhost:8090')); // Open browser after server is ready
});

const wss = new WebSocket.Server({ server });

app.use(express.static(path.join(__dirname, '../web')));

wss.on('connection', (ws) => {
  console.log('New client connected');
  
  ws.on('message', (message) => {
    console.log('received: %s', message);

    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });

  ws.send('Welcome to the WebSocket server!');
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../web/index.html'));
});
