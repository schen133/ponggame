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

// a event for socket, is a connection
// or a message
// or a disconnection
// new connection
// socket action on an connect event, a function to handle that event
io.sockets.on("connection", newConnection);

// any new connection to the sockets will be a separate socket connection

// Global variables

const players = {};

const count = {};

var game_started = false;

// Global variables that doesn't change
const ball_coordinates = [150, 150];

var xspeed = -3;
var yspeed = -1;

var gameLobby = [];
// but when
// when game starts, we can assign a unique gameLobbyID
// hash it: {gameLobbyID: {}, gameLobbyID: {}}
// gameLobbyID:{gameStarted: false/true,
//              player_positions(players): {socketID: [x, y] , socketID: [x, y]}
//              ball_coordinates: [150, 150]
//             }

// when game starts, pass gameLobbyID as a constructor into the object intialization
// this way it will allow O(1) lookup and direct update of the memory allocated for the object

// if a player from a on-going game quits in the middle of the game, we can take him
// and re-assign him to a game-lobby that's current not filled
// he loses all data from previous game...

// every actions by socket will be listened to here
function newConnection(socket) {
  // on socket disconnecting, remove socket id from hashmap
  socket.on("disconnect", () => {
    delete players[socket.id];

    console.log(socket.id, "has quit the game");
  });

  // ensured each client has its own socket id
  // so then when we broadcast out all players positions
  // we can use that record (their own socketID) to distinguish their own position vs opponent's
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
  }


  // on every new connection made, check if there is a game lobby that's ready to start
  // 

  // if a player from a 



  // TODOs: fix up some data not needed in the frontend
  if (Object.keys(players).length === 2) {
    var gamestart_data = {
      players: players,
      count: count,
      ball_initial: [150, 150],
      ball_speed_x: xspeed,
    };

    io.sockets.emit("gameStarts", gamestart_data);

    // repeatly executes a logic with an interval
    // 16 milliseconds for each function execution
    // approximately 60 times a second -> to achieve 60 FPS ball movement on client side
    // do ball logic and emit every 16ms
    // or should be do logic the entire time and emit every 16 seconds?
    setInterval(round, 5);
  }

  // each time server socket instance receives a signal from client socket instance
  // we call the changeCoordinates function and update player position and broadcast to all sockets
  socket.on("keyPressed", changeCoordinates);
  function changeCoordinates(data) {
    players[socket.id][1] = players[socket.id][1] + data.y;
    // broadcasting here
    io.sockets.emit("positions", players);
  }
}

var game_progress = true;

// player board size (represented as rectangle)
const rec_width = 10;
const rec_length = 150;

// ball radius
const r = 15;

// size of canvas, game board
const height = 400;
const width = 400;

function round() {
  // TODOS: Better ball movement physic logics
  const iterator = Object.values(players);

  const player1 = iterator[0];
  const player2 = iterator[1];

  console.log(player1);
  console.log(player2);

  ball_coordinates[0] += xspeed;
  // ball_coordinates[1] += yspeed;
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
  // if (ball_coordinates[1] > height - r || ball_coordinates[1] < r) {
  //   yspeed = -yspeed;
  // }
  // console.log("calls");

  // In the end, broadcast ball_coordinates to all connected sockets
  io.sockets.emit("ballposition", ball_coordinates);
}

function startgame(gamestarts) {}

// TODOs:
// Probbaly need a lobby system as well
// each bucket can fit two players(sockets) who makes a connection to the server
//

// Game object
// on each full lobby, we create a game object
// it can create many round instances and keep track of the score returned by each round

// Round object
// on each start of the round, we do a return of the score
// who won
// then keep that recorde
