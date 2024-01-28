const express = require("express");
const app = express();

var server = app.listen(3000);

// static files, non dynamic
// i want the app to host everything in that public directory
// user can see what's in the public directory
app.use(express.static("public"));

var socket = require("socket.io");

// create an actual socket that's part of the server

// the thing keep track of the inputs/outputs
var io = socket(server);

// deal with events

// a event for socket, is a connection
// or a message
// or a disconnection
// new connection
// socket action on an connect event, a function to handle that event
io.sockets.on("connection", newConnection);

// any new connection to the sockets will be a separate socket connection

// Global variables

const player1 = [20, 50];
const player2 = [40, 50];

const players = {};

var game_started = false;

// a two player hashmap with their socket key matched in the

function newConnection(socket) {
  // on disconnecting, remove socket id from hashmap
  socket.on("disconnect", () => {
    delete players[socket.id];

    console.log(players);
  });

  //   ensured each client has its own socket id
  socket.emit("socketID", socket.id);

  //   on new connection, add socket id to hashmap

  //   {socket.id: [],
  //      socket.id: []    }
  if (!(socket.id in players)) {
    if (Object.keys(players).length > 0) {
      players[socket.id] = [100, 50];
    } else {
      players[socket.id] = [20, 50];
    }
    console.log(players);
  }

  //
  if (Object.keys(players).length === 2) {
    //
    io.sockets.emit("gameStarts", players);
  }


  socket.on("keyPressed", changeCoordinates);

  function changeCoordinates(data) {
    players[socket.id][1] = players[socket.id][1] + data.y;

    // emit the new player position to all player
    io.sockets.emit("positions", players);

    // broadcast it out to all connections
    // update the player's value and broadcast updated value to everyone
  }

  



}
