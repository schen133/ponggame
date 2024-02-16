import { p1Contact, p2Contact } from "./physics.js";

import { v4 as uuidv4 } from 'uuid';

// const express = require("express");
import express from "express";
const app = express();

var server = app.listen(3000);

// static files, non dynamic
// i want the app to host everything in that public directory
// user can see what's in the public directory
app.use(express.static("public"));

// var socket = require("socket.io");
import { Server as socket } from "socket.io";

// create an actual socket that's part of the server

// the thing keep track of the inputs/outputs
var io = new socket(server);

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

var xspeed = -5;
var yspeed = -1;

var gameLobby = {};
var player_gameLobby = {}


// but when
// when game starts, we can assign a unique gameLobbyID
// hash it: {gameLobbyID: {}, gameLobbyID: {}}
// gameLobbyID:{gameStarted: false/true,
//              player_positions(players): {socketID: [x, y] , socketID: [x, y]}
//              ball_coordinates: [150, 150]
//             }

// when game starts, pass gameLobbyID as a constructor into the object intialization
// this way it will allow O(1) lookup and direct update of the memory allocated for the object
// A class for gameObjectLobby is probbaly better, we can write better method logics to handle
// sepecific logic for game object lobby
class GameObjectLobby {
  constructor(gameLobbyId, ball_coordinates, firstPlayerSocketID) {

    // constructor called when we create a lobby,
    // which we only create a lobby when there is a new connection but no other gamestarted == false lobby left
    this.gameLobbyId = gameLobbyId
    this.ball_coordinates = ball_coordinates
    // the first time the game object lobby object is made, we only have one player for the lobby
    this.gameStarted = false

    this.player_positions = { [firstPlayerSocketID]: [20, 150] }
    player_gameLobby[firstPlayerSocketID] = this.gameLobbyId
  }
  addNewPlayer(socketID) {

    // player_positions is an dicitonary
    this.player_positions[socketID] = [300, 150]
    player_gameLobby[socketID] = this.gameLobbyId

    // check if lobby has two players 
    if (Object.values(this.player_positions).length == 2) {
      this.startGame()
    }
  }
  deletePlayer(socketID) {
    delete this.player_positions[socketID]
    console.log("player quit, current game lobby object: \n", this)
  }
  startGame() {

    this.gameStarted = true
  }

  pauseGame() {

    this.gameStarted = false
  }




}



//function testingObject() {
//  const testingClass = new GameObjectLobby("testingGLID", false, [150, 150],)
//  console.log("hello, this is testingClass", testingClass)
//  console.log(testingClass.gameLobbyId)
//}
//testingObject()


// if a player from a on-going game quits in the middle of the game, we can take him
// and re-assign him to a game-lobby that's current not filled
// he loses all data from previous game...

// every actions by socket will be listened to here
function newConnection(socket) {
  // on socket disconnecting, remove socket id from hashmap
  // TODO: when player quit a on-going game, we can keep the game Lobby,
  // but we need a game reset function to empty out the scores and etc...
  socket.on("disconnect", () => {
    delete players[socket.id];
    const temp_lobby_id = player_gameLobby[socket.id]
    // now we have the lobby id 
    const gameLobby_object = gameLobby[temp_lobby_id]
    if (gameLobby_object.gameStarted) {
      gameLobby_object.pauseGame()

    }

    gameLobby_object.deletePlayer(socket.id)
    if (Object.values(gameLobby_object.player_positions).length == 0) {
      delete gameLobby[temp_lobby_id]
    }

    console.log("player left lobby")
    console.log("current game lobby list:\n", gameLobby)

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
  Object.values(gameLobby).every((gameObjectLobby) => {

    if (gameObjectLobby.gameStarted == false) {

      gameObjectLobby.addNewPlayer(socket.id)
      //break out of the loop to avoid pushing to other lobby
      return false
    }
    else {
      //return true as in continueing looking for open lobby
      return true
    }

  })
  if (!(player_gameLobby[socket.id])) {
    const generated_gameLobbyID = uuidv4()
    gameLobby[generated_gameLobbyID] = new GameObjectLobby(generated_gameLobbyID, ball_coordinates, socket.id)

  }
  console.log("player joined lobby")
  console.log("current game lobby list:\n", gameLobby)

  // on every new connection made, check if there is a game lobby that's ready to start
  // 

  // if a player from a 


  // This is to handle logic when the game starts
  // When a new connection happens, we iterate through each room to check rooms that is ready to start 
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
    setInterval(round, 16);
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

  //console.log(player1);
  //console.log(player2);

  ball_coordinates[0] += xspeed;
  // ball_coordinates[1] += yspeed;
  //   left condition is so it bounces off right

  // keeping array-access only once, since array access is not for modification
  let ball_x = ball_coordinates[0];
  let ball_y = ball_coordinates[1];
  let ball_r = r;  // variable name for clarity
  let player1_x = player1[0];
  let player1_y = player1[1];
  let player2_x = player2[0];
  let player2_y = player2[1];

  if (p1Contact(ball_x, ball_y, ball_r, player1_x, player1_y, rec_length)) {
    xspeed = -xspeed;
  }
  if (p2Contact(ball_x, ball_y, ball_r, player2_x, player2_y, rec_length)) {
    xspeed = -xspeed;
  }

  // if (ball_coordinates[1] > height - r || ball_coordinates[1] < r) {
  //   yspeed = -yspeed;
  // }
  // console.log("calls");

  // In the end, broadcast ball_coordinates to all connected sockets
  io.sockets.emit("ballposition", ball_coordinates);
}

function startgame(gamestarts) { }

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
