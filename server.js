// server.js

const express = require('express');
const SocketServer = require('ws').Server;
const WebSocket = require('ws');
const uuidV4 = require('uuid/v4');

// Set the port to 4000
const PORT = 4000;

// Create a new express server
const server = express()
   // Make the express server serve static assets (html, javascript, css) from the /public folder
  .use(express.static('public'))
  .listen(PORT, '0.0.0.0', 'localhost', () => console.log(`Listening on ${ PORT }`));

// Create the WebSockets server
const wss = new SocketServer({ server });

// Set up a callback that will run when a client connects to the server
// When a client connects they are assigned a socket, represented by
// the ws parameter in the callback.]

function broadcastClientCount () {
  wss.clients.forEach(function each(client) {
    const clientCount = {
      type: "clientCount",
      clientcount: wss.clients.size,
    }
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(clientCount));
      }
  });
}
const COLORS = ["red", "blue", "green", "yellow"];

function getRandomColor() {
  return COLORS[Math.floor(Math.random()*COLORS.length)]
}

function broadcastClientColor () {
    const clientColor = {
      type: "clientColor",
      color: getRandomColor()
    }
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(clientColor));
      }
  });
}


wss.on('connection', (ws) => {
  console.log('Client connected');
  broadcastClientCount();
  ws.userColor = getRandomColor();
  // Set up a callback for when a client closes the socket. This usually means they closed their browser.
  ws.on('close', () => {
    console.log('Client disconnected')
    broadcastClientCount();
  });

  ws.on('message', function incoming(data) {
    const message = JSON.parse(data);
    //Deals with message content
    if (message.type === "postMessage") {
      message.id = uuidV4();
      message.type = "incomingMessage";
      message.color = ws.userColor;
      console.log(message.username + " said " + message.content);
      wss.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(message));
        }
      });
    // Deals with changing username notifications
    } else if (message.type === "postNotification") {
      message.type = "incomingNotification";
      message.id = uuidV4();
      wss.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(message));
        }
      });
    }
  });
});
