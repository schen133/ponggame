// this serves as the sketch.js file for p5.js

// connect to a socket here, a reference to the socket library in the
// client
var socket;

// player himself
// each time this player moves the cursor, we will send the location to the server
var player_1_coordinates;

// the other player
var player_2_coordinates;

var me_id;

var opp_id;

const max_width = 400;
const max_height = 400;

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
  socket.on("gameStarts", (players) => {
    // game starts here

    player_1_coordinates = players[me_id];

    opp_id = Object.keys(players).find((id) => id !== me_id);

    player_2_coordinates = players[opp_id];
  });

  socket.on("positions", (players) => {
    console.log(players);
    player_1_coordinates = players[me_id];

    player_2_coordinates = players[opp_id];
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

    rect(player_1_coordinates[0], player_1_coordinates[1], 10, 70);
  }

  if (player_2_coordinates) {
    fill(255, 204, 0);

    rect(player_2_coordinates[0], player_2_coordinates[1], 10, 70);
  }
  keyPressed();

  // ellipse(mouseX, mouseY, 80, 80);
}

function draw_ball() {}

// more funciton for ball's movement later

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

  // don't change coordinate here, send event to the backend and let backend
  // do the coordinate changes and send it to the client again
  // console.log(player_1_coordinates[1]);
}

// moves player1's board down
function downKey() {
  var data = {
    x: 0,
    y: 5,
  };

  socket.emit("keyPressed", data);

  // console.log(player_1_coordinates[1]);
}
