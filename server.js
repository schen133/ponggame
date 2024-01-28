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

const player1 = [20, 200];
const player2 = [40, 200];

const players = {};

const count = {};

var game_started = false;

// for ball
const ball_coordinates = [];

var ball_speed = -5;

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
      count[socket.id] = 2;

      players[socket.id] = [300, 150];
    } else {
      count[socket.id] = 1;
      players[socket.id] = [20, 150];
    }
    console.log(players);
  }

  //
  if (Object.keys(players).length === 2) {
    var gamestart_data = {
      players: players,
      count: count,
      ball_initial: [150, 150],
      ball_speed_x: ball_speed,
    };
    //

    console.log(gamestart_data);
    // io.sockets.emit("gameStarts", players);
    io.sockets.emit("gameStarts", gamestart_data);
  }

  socket.on("keyPressed", changeCoordinates);

  function changeCoordinates(data) {
    players[socket.id][1] = players[socket.id][1] + data.y;

    // emit the new player position to all player
    io.sockets.emit("positions", players);

    // broadcast it out to all connections
    // update the player's value and broadcast updated value to everyone
  }

  socket.on("changeDirection_x", (speed) => {
    ball_speed = -ball_speed;
    io.sockets.emit("receiveX", ball_speed);
  });
}

// how do i synchronize the ball movement right here?

// ball obviously needs to have a coordinate in the server itself
// then we can constantly broadcast that position to all the clients

// send in a coordinate and goes in a direction, then when it hits something
// in the one of the client, it sends smt back to the server?

// but which client tho

// or we can possibly just do, the server consistently sends out ball movement to every clients

// server has update ball position
// the client send a ball posiiton

// once it hits a bounce off, client emit a update
// then server receives that and broadcast new direction of ball movement to all clients

// if it hits
