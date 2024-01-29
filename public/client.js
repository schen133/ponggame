// this serves as the sketch.js file for p5.js

// connect to a socket here, a reference to the socket library in the
// client
var socket;

// player himself
// each time this player moves the cursor, we will send the location to the server
var player_1_coordinates;

// the other player
var player_2_coordinates;

// x and y for the ball
var ball_coordinates;


var me_id;

var opp_id;

const max_width = 400;
const max_height = 400;

var rec_width = 10;
var rec_length = 150;
const ball_radius = 15;

var player_count;
function setup() {
  createCanvas(max_width, max_height);
  // connects to the server here
  socket = io.connect("http://localhost:3000/");

  // get both id
  socket.on("socketID", function (id) {
    me_id = id;
  });

  // when the setup is called, it means the game can start
  // then we initialize everything that we need to
  socket.on("gameStarts", (data) => {
    // game starts here

    var players = data.players;

    opp_id = Object.keys(players).find((id) => id !== me_id);

    player_1_coordinates = players[me_id];

    player_2_coordinates = players[opp_id];

    player_count = data.count[me_id];

    console.log("game will start in 5 seconds");

    setTimeout(() => {
      ball_coordinates = data.ball_initial;

      // game starts, ball starts moving
      ball_x_speed = data.ball_speed_x;
    }, 3000);
  });

  socket.on("positions", (players) => {
    console.log(players);
    player_1_coordinates = players[me_id];

    player_2_coordinates = players[opp_id];
  });

  // turns the direction of ball when one client signals the server to do so
  socket.on("receiveX", (data) => {
    ball_x_speed = data;
    console.log(ball_x_speed);
  });

  socket.on("ballposition", (data) => {
    ball_coordinates = data;
  });

  //
}

function drawOther() {
  fill(255, 204, 0);

  rect(player_2_coordinates[0], player_2_coordinates[1], 10, 70);
}

function draw() {
  background(51);

  //myself will always be black
  if (player_1_coordinates) {
    fill(0);

    rect(player_1_coordinates[0], player_1_coordinates[1], 10, rec_length);
  }

  if (player_2_coordinates) {
    fill(255, 204, 0);

    rect(player_2_coordinates[0], player_2_coordinates[1], 10, rec_length);
  }

  // if ball_coordinates, keep drawing out where the ball is
  if (ball_coordinates) {
    fill(255, 128, 0);
    // draws the ball but with a function that always changes the x and y coordinate values of the ball
    ellipse(ball_coordinates[0], ball_coordinates[1], ball_radius, ball_radius);
  }
  keyPressed();
}

function ball_movement() {
  ball_coordinates[0] -= ball_x_speed;

  // ball_coordinates[1] += ball_y_speed;
}

//

// ** player1's movements
function keyPressed() {
  // if the coordinate already hits, you don't need to do un-needed emits
  if (keyIsDown(UP_ARROW) && player_1_coordinates[1] > 0) {
    upKey();
  } else if (
    keyIsDown(DOWN_ARROW) &&
    player_1_coordinates[1] < max_height - 70
  ) {
    downKey();
  }
}

// moves player1's board up
function upKey() {
  var data = {
    x: 0,
    y: -5,
  };
  socket.emit("keyPressed", data);
}

// moves player1's board down
function downKey() {
  var data = {
    x: 0,
    y: 5,
  };
  socket.emit("keyPressed", data);
}

//
