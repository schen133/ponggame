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

// make this a reference of who ever the first player is in the hashmap
var player1;
var player2;

const players = {};

const count = {};

var game_started = false;

// for ball
const ball_coordinates = [150, 150];

var xspeed = -3;
var yspeed = -1;

// a two player hashmap with their socket key matched in the

function newConnection(socket) {
  // on disconnecting, remove socket id from hashmap
  socket.on("disconnect", () => {
    delete players[socket.id];

    console.log(players);

    console.log(player1);
    console.log(player2);
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
      player2 = players[socket.id];

      console.log(player2);
    } else {
      count[socket.id] = 1;
      players[socket.id] = [20, 150];
      player1 = players[socket.id];
      console.log(player1);
    }
  }

  //
  if (Object.keys(players).length === 2) {
    var gamestart_data = {
      players: players,
      count: count,
      ball_initial: [150, 150],
      ball_speed_x: xspeed,
    };
    //

    console.log(gamestart_data);
    // io.sockets.emit("gameStarts", players);
    io.sockets.emit("gameStarts", gamestart_data);

    // setTimeout(() => round(), 5000);

    setInterval(round, 16);
  }

  socket.on("keyPressed", changeCoordinates);

  function changeCoordinates(data) {
    players[socket.id][1] = players[socket.id][1] + data.y;

    // emit the new player position to all player
    io.sockets.emit("positions", players);

    // broadcast it out to all connections
    // update the player's value and broadcast updated value to everyone
  }

  // socket.on("changeDirection_x", (speed) => {
  //   ball_speed = -ball_speed;
  //   io.sockets.emit("receiveX", ball_speed);
  // });
}

var game_progress = true;

const rec_width = 10;
const rec_length = 150;
const r = 15;
const height = 400;
const width = 400;

function round() {
  //

  // var ball_x = ball_coordinates[0] + ball_radius;
  // var ball_y = ball_coordinates[1] + ball_radius;

  // for all values within players
  const iterator = Object.values(players);

  const player1 = iterator[0];
  const player2 = iterator[1];

  // ball_x and ball_y encountering with

  ball_coordinates[0] += xspeed;
  ball_coordinates[1] += yspeed;
  //   left condition is so it bounces off right
  if (
    (ball_coordinates[0] > player2[0] - r &&
      ball_coordinates[1] >= player2[1] &&
      ball_coordinates[1] <= player2[1] + rec_length) ||
    (ball_coordinates[0] < player1[0] + r * 2 &&
      ball_coordinates[1] >= player2[1] &&
      ball_coordinates[1] <= player2[1] + rec_length)
  ) {
    xspeed = -xspeed;
  }
  if (ball_coordinates[1] > height - r || ball_coordinates[1] < r) {
    yspeed = -yspeed;
  }
  // console.log("calls");

  // broadcast ball_coordianates

  io.sockets.emit("ballposition", ball_coordinates);
}

function startgame(gamestarts) {}
