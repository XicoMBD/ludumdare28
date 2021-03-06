var util = require("util");
var http = require("http");
var path = require("path");
var ecstatic = require("ecstatic");
var io = require("socket.io");
var moment = require("moment");
var Player = require("./Player").Player;
var Gun = require("./Gun").Gun;
var Matches = require("./Matches").Matches;
var Apple = require("./Apple").Apple;
var FirstAid = require("./FirstAid").FirstAid;
var PillFood = require("./PillFood").PillFood;
var PillLife = require("./PillLife").PillLife;
var PillOxygen = require("./PillOxygen").PillOxygen;
var Compass = require("./Compass").Compass;
var Oxygen = require("./Oxygen").Oxygen;
var Instructions = require("./Instructions").Instructions;
var SpaceShipEnding = require("./SpaceShipEnding").SpaceShipEnding;
var Ravine = require("./Ravine").Ravine;
var Monster = require("./Monster").Monster;
var Rope = require("./Rope").Rope;
var Radio = require("./Radio").Radio;

// var fs = require('fs');

/**************************************************
** GAME VARIABLES
**************************************************/
var socket,		// Socket controller
  guns,		// Array of guns
  objects, 	// Array of game objects
  scores,
  stats;


/**************************************************
** GAME INITIALISATION
**************************************************/
var port = process.env.PORT || 8000

// Create and start the http server
var server = http.createServer(
  ecstatic({ root: path.resolve(__dirname, './public') })
).listen(port, function (err) {
  if (err) {
    throw err
  }

  init()
})

function init() {
  // Create an empty array to store players
  players = [];
  scores = [];
  stats = [];

  // Create empty arrays to store objects
  objects = [];

  // Set up Socket.IO to listen on port 8000
  socket = io.listen(server);

  // Configure Socket.IO
  socket.configure(function() {
    // Only use WebSockets
    socket.set("transports", ["websocket"]);

    // Restrict log output
    socket.set("log level", 2);
  });

  // fs.readFile('./../highscores.json', function read(err, data) {
  //     if (err) {
  //         console.log(err);
  //         return;
  //     }
  //     scores = JSON.parse(data);
  // });
  //
  // fs.readFile('./../stats.json', function read(err, data) {
  //     if (err) {
  //         console.log(err);
  //         return;
  //     }
  //     stats = JSON.parse(data);
  // });

  newServer();

  // Start listening for events
  setEventHandlers();
};


/**************************************************
** NEW SERVER
**************************************************/
function newServer() {
  objects = [];
  var side = getRandomPlusOrMinus();
  // Place Ravine
  var newObject = new  Ravine(side*getRandomInt(2000, 3000), 200);
    newObject.id = "BR0";
    objects.push(newObject);

  // Place Ravine
  var newObject = new  Monster(side*getRandomInt(1000, 2000), 200);
    newObject.id = "BM0";
    objects.push(newObject);

  // Place guns randomly
  for(var i=0; i < getRandomInt(3, 10); i++) {
    var newObject = new Gun(getRandomInt(-1000, 1000), getRandomInt(200, 700));
    newObject.id = "G"+i;
    objects.push(newObject);
  }

  // Place matches randomly
  for(var i=0; i < getRandomInt(3, 10); i++) {
    var newObject = new Matches(getRandomInt(-1000, 1000), getRandomInt(200, 700));
    newObject.id = "M"+i;
    objects.push(newObject);
  }

  // Place Apple randomly
  for(var i=0; i < getRandomInt(3, 10); i++) {
    var newObject = new Apple(getRandomInt(-1000, 1000), getRandomInt(200, 700));
    newObject.id = "A"+i;
    objects.push(newObject);
  }

  // Place FirstAid randomly
  for(var i=0; i < getRandomInt(3, 10); i++) {
    var newObject = new FirstAid(getRandomInt(-1000, 1000), getRandomInt(200, 700));
    newObject.id = "F"+i;
    objects.push(newObject);
  }

  // Place Oxygen randomly
  for(var i=0; i < getRandomInt(3, 10); i++) {
    var newObject = new Oxygen(getRandomInt(-1000, 1000), getRandomInt(200, 700));
    newObject.id = "O"+i;
    objects.push(newObject);
  }

  // Place Radio randomly
  for(var i=0; i < getRandomInt(3, 10); i++) {
    var newObject = new Radio(getRandomInt(-1000, 1000), getRandomInt(200, 700));
    newObject.id = "R"+i;
    objects.push(newObject);
  }

  /*
  // Place PillFood randomly
  for(var i=0; i < 10; i++) {
    var newObject = new  PillFood(getRandomInt(-1000, 1000), getRandomInt(200, 700));
    newObject.id = "EF"+i;
    objects.push(newObject);
  }

  // Place PillLife randomly
  for(var i=0; i < 10; i++) {
    var newObject = new  PillLife(getRandomInt(-1000, 1000), getRandomInt(200, 700));
    newObject.id = "EL"+i;
    objects.push(newObject);
  }

  // Place PillOxygen randomly
  for(var i=0; i < 10; i++) {
    var newObject = new  PillOxygen(getRandomInt(-1000, 1000), getRandomInt(200, 700));
    newObject.id = "EO"+i;
    objects.push(newObject);
  }
  */
  for(var i=0; i < getRandomInt(3, 10); i++) {
    var newObject = new  Compass(getRandomInt(-1000, 1000), getRandomInt(200, 700));
    newObject.id = "C"+i;
    objects.push(newObject);
  }

  for(var i=0; i < getRandomInt(3, 10); i++) {
    var newObject = new  Instructions(getRandomInt(-100, 100), getRandomInt(200, 700));
    newObject.id = "I"+i;
    objects.push(newObject);
  }

  for(var i=0; i < getRandomInt(3, 10); i++) {
    var newObject = new  Rope(getRandomInt(-1000, 1000), getRandomInt(200, 700));
    newObject.id = "ER"+i;
    objects.push(newObject);
  }

  // Place SpaceShipEnding
  var newObject = new  SpaceShipEnding(side*getRandomInt(4000, 6000), 200);
    newObject.id = "S0";
    objects.push(newObject);

  //util.log(JSON.stringify(objects));
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomPlusOrMinus() {
  return Math.random() < 0.5 ? -1 : 1;
}
/**************************************************
** GAME EVENT HANDLERS
**************************************************/
var setEventHandlers = function() {
  // Socket.IO
  socket.sockets.on("connection", onSocketConnection);
};

// New socket connection
function onSocketConnection(client) {
  util.log("New player has connected: "+client.id);

  // Listen for client disconnected
  client.on("disconnect", onClientDisconnect);

  // Listen for new player message
  client.on("new player", onNewPlayer);

  // Listen for new player message
  client.on("dead player", onDeadPlayer);

  // Listen for new player message
  client.on("player score", onPlayerScore);

  // Listen for new player message
  client.on("player shot", onPlayerShot);

  // Listen for move player message
  client.on("move player", onMovePlayer);

  // Listen for catch object message
  client.on("catch object", onCatchObject);

  // Listen for catch object message
  client.on("drop object", onDropObject);

  // Listen for catch object message
  client.on("object used", onObjectUsed);

  // Listen for catch object message
  client.on("object fixed", onObjectFixed);

  // Listen for low level message
  client.on("low level", onLowLevel);

  // Listen for low level message
  client.on("the end", onTheEnd);
};

// Socket client has disconnected
function onClientDisconnect() {
  util.log("Player has disconnected: "+this.id);

  var removePlayer = playerById(this.id);

  // Player not found
  if (!removePlayer) {
    util.log("Player not found: "+this.id);
    return;
  };

  // Remove player from players array
  players.splice(players.indexOf(removePlayer), 1);

  // Broadcast removed player to connected socket clients
  this.broadcast.emit("remove player", {id: this.id});
};

// New player has joined
function onNewPlayer(data) {
  // Create a new player
  var newPlayer = new Player(data.x, data.y);
  newPlayer.id = this.id;

  // Broadcast new player to connected socket clients
  this.broadcast.emit("new player", {id: newPlayer.id, x: newPlayer.getX(), y: newPlayer.getY(), dead: newPlayer.dead});

  this.emit("your id", {id: this.id});

  // Send existing players to the new player
  var i, existingPlayer;
  for (i = 0; i < players.length; i++) {
    existingPlayer = players[i];
    this.emit("new player", {id: existingPlayer.id, x: existingPlayer.getX(), y: existingPlayer.getY(), dead: existingPlayer.dead});
  };

  var existingObject;
  for (i = 0; i < objects.length; i++) {
    existingObject = objects[i];
    this.emit("new object", {id: existingObject.id, x: existingObject.getX(), y: existingObject.getY(), onPlayer: existingObject.onPlayer, used: existingObject.used, fixed: existingObject.fixed });
  };

  // Add new player to the players array
  players.push(newPlayer);
};

// Player has moved
function onMovePlayer(data) {
  // Find player in array
  var movePlayer = playerById(this.id);

  // Player not found
  if (!movePlayer) {
    util.log("Player not found: "+this.id);
    return;
  };

  // Update player position
  movePlayer.setX(data.x);
  movePlayer.setY(data.y);

  // Broadcast updated position to connected socket clients
  this.broadcast.emit("move player", {id: movePlayer.id, x: movePlayer.getX(), y: movePlayer.getY()});
};

// Player has moved
function onDeadPlayer(data) {
  // Find player in array
  var deadPlayer = playerById(this.id);

  // Player not found
  if (!deadPlayer) {
    util.log("Player not found: "+this.id);
    return;
  };

  deadPlayer.dead = true;
  deadPlayer.playTime = moment().diff(deadPlayer.startTime, 'seconds');

  // Broadcast updated position to connected socket clients
  this.broadcast.emit("dead player", {id: deadPlayer.id, stats: deadPlayer.finalStats});
};

// Player has moved
function onPlayerShot(data) {
  // Find player in array
  var deadPlayer = playerById(data.shotId);
  var shooterPlayer = playerById(data.shooterId);

  // Player not found
  if (!deadPlayer) {
    util.log("Player not found: "+this.shotId);
    console.log(JSON.stringify(players));
    return;
  };

  console.log(data.shooterId, "SHOOOOOOT", data.shotId);
  shooterPlayer.playersShotPoints += 1;

  // Broadcast updated position to connected socket clients
  this.broadcast.emit("player shot", {shotId: deadPlayer.id, shooterId: data.shooterId});
};

// Player has moved
function onPlayerScore(data) {
  // Find player in array
  var deadPlayer = playerById(this.id);

  // Player not found
  if (!deadPlayer) {
    util.log("Player not found: "+this.id);
    return;
  };

  var score = deadPlayer.getExploration()/2 + 70 * deadPlayer.objectsFixed + 200 * deadPlayer.playersShotPoints - deadPlayer.playTime - deadPlayer.objectsCount/2;

  deadPlayer.finalStats = {
    name: data.playerName,
    exploration: deadPlayer.getExploration(),
    moveAmount: deadPlayer.getMoveAmount(),
    objectsCount: deadPlayer.objectsCount,
    objectsFixed: deadPlayer.objectsFixed,
    playersShotPoints: deadPlayer.playersShotPoints,
    startTime: deadPlayer.startTime,
    playTime: deadPlayer.playTime,
    score: score
  }

  stats.push(deadPlayer.finalStats);

  // fs.writeFile("../stats.json", JSON.stringify(stats), function(err) {
  //     if(err) {
  //         console.log(err);
  //     } else {
  //         console.log("The stats file was saved!");
  //     }
  // });

  scores.push({
    name: data.playerName,
    score: score
  });

  scores.sort(function (a,b) {
    if (a.score > b.score)
       return -1;
    if (a.score < b.score)
      return 1;
    return 0;
  });

  // fs.writeFile("../highscores.json", JSON.stringify(scores), function(err) {
  //     if(err) {
  //         console.log(err);
  //     } else {
  //         console.log("The file was saved!");
  //     }
  // });


  // Broadcast updated position to connected socket clients
  this.emit("highscores", {scores: scores, stats: deadPlayer.finalStats});
};

// Player has moved
function onCatchObject(data) {
  // Find player in array
  var catchPlayer = playerById(this.id);
  var catchObject = objectById(data.objectId);
  // Player not found
  if (!catchPlayer) {
    util.log("Player not found: "+this.id);
    return;
  };

  if(!catchObject) {
    util.log("Object not found: "+data.objectId);
    return;
  };

  //console.log("CATCHED THE", catchObject.id);

  var dropObject = objectById(catchPlayer.objectId);

  if(dropObject) {
    dropObject.onPlayer = false;
    var tmpX = catchObject.getX();
    var tmpY = catchObject.getY();

    dropObject.setX(tmpX);
    dropObject.setY(tmpY);

    //console.log("DROP THE", dropObject.id, "IN", tmpX, tmpY);

    this.emit("drop object", {id: catchPlayer.id, objectId: dropObject.id, x: tmpX, y: tmpY});
    this.broadcast.emit("drop object", {id: catchPlayer.id, objectId: dropObject.id, x: tmpX, y: tmpY});
  };

  catchObject.onPlayer = true;
  catchPlayer.objectId = catchObject.id;
  catchPlayer.objectsCount += 1;

  //console.log(JSON.stringify(catchPlayer));

  // Broadcast updated position to connected socket clients
  this.broadcast.emit("catch object", {id: catchPlayer.id, objectId: catchObject.id});
};

// Player has moved
function onDropObject(data) {
  // Find player in array
  var dropPlayer = playerById(data.id);
  var dropObject = objectById(data.objectId);
  // Player not found
  if (!dropPlayer) {
    util.log("Player not found: "+this.id);
    return;
  };

  if(!dropObject) {
    util.log("Object not found: "+data.objectId);
    return;
  };

  dropPlayer.objectId = "";
  dropObject.onPlayer = false;

  dropObject.setX(data.x);
  dropObject.setY(data.y);

  console.log("DROP THE", dropObject.id, "IN", data.x, data.y);

  //this.emit("drop object", {id: dropPlayer.id, objectId: dropObject.id, x: tmpX, y: tmpY});
  this.broadcast.emit("drop object", {id: dropPlayer.id, objectId: dropObject.id, x: data.x, y: data.y});
};

// Object used
function onObjectUsed(data) {
  // Find player in array
  var dropPlayer = playerById(data.id);
  var usedObject = objectById(data.objectId);
  // Player not found
  if (!dropPlayer) {
    util.log("Player not found: "+this.id);
    return;
  };

  if(!usedObject) {
    util.log("Object not found: "+data.objectId);
    return;
  };

  dropPlayer.objectId = "";
  usedObject.onPlayer = false;

  usedObject.setX(data.x);
  usedObject.setY(data.y);
  usedObject.used = true;

  console.log("USED THE", usedObject.id);

  //this.emit("drop object", {id: dropPlayer.id, objectId: dropObject.id, x: tmpX, y: tmpY});
  this.broadcast.emit("object used", {id: dropPlayer.id, objectId: usedObject.id, x: data.x, y: data.y});
};

// Object used
function onObjectFixed(data) {
  // Find player in array
  var dropPlayer = playerById(data.id);
  var fixedObject = objectById(data.objectId);
  // Player not found
  if (!dropPlayer) {
    util.log("Player not found: "+this.id);
    return;
  };

  if(!fixedObject) {
    util.log("Object not found: "+data.objectId);
    return;
  };

  console.log("FIXED THE", fixedObject.id);

  fixedObject.fixed = true;
  dropPlayer.objectsFixed += 1;

  //this.emit("drop object", {id: dropPlayer.id, objectId: dropObject.id, x: tmpX, y: tmpY});
  this.broadcast.emit("object fixed", {id: dropPlayer.id, objectId: fixedObject.id});
};

// Player has low level
function onLowLevel(data) {
  // Find player in array
  var lowPlayer = playerById(this.id);

  // Player not found
  if (!lowPlayer) {
    util.log("Player not found: "+this.id);
    return;
  };
  console.log("LOW LEVEL OF", data.kind);
  // Broadcast updated position to connected socket clients
  this.broadcast.emit("low level", {id: lowPlayer.id, kind: data.kind});
};

// Player has low level
function onTheEnd(data) {
  newServer();

  playerById(data.id).playTime = moment().diff(playerById(data.id).startTime, 'seconds');

  // Broadcast updated position to connected socket clients
  this.broadcast.emit("the end", {});
};


/**************************************************
** GAME HELPER FUNCTIONS
**************************************************/
// Find player by ID
function playerById(id) {
  var i;
  for (i = 0; i < players.length; i++) {
    if (players[i].id == id)
      return players[i];
  };

  return false;
};

// Find object by ID
function objectById(id) {
  var i;
  for (i = 0; i < objects.length; i++) {
    if (objects[i].id == id)
      return objects[i];
  };

  return false;
};
