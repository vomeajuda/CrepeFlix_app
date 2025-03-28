const WebSocket = require('ws');
const express = require('express');

const app = express();
const server = app.listen(8080, () => console.log('Server running on http://localhost:8080'));
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  console.log('New client connected');
  
  // Handle incoming messages from clients
  ws.on('message', (message) => {
    console.log('received: %s', message);
    
    // Broadcast the message to all connected clients
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });

  // Send a welcome message to the newly connected client
  ws.send('Welcome to the WebSocket server!');
});

app.get('/', (req, res) => {
  res.send('WebSocket server is running');
});
