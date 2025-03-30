const WebSocket = require('ws');
const express = require('express');

const app = express();
const server = app.listen(8090, () => console.log('Server running on http://localhost:8090'));
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  console.log('New client connected');
  
  ws.on('message', (message) => {
    console.log('received: %s', message);
    
    // Broadcast the message to all connected clients
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });

  ws.send('Welcome to the WebSocket server!');
});

app.get('/', (req, res) => {
  res.send('WebSocket server is running');
});
