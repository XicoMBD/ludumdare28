/**************************************************
** GAME SpaceShipEnding CLASS
**************************************************/
var SpaceShipEnding = function(startX, startY) {
	var x = startX,
		y = startY,
		onPlayer = false,
		image,
		id;

	image = new Image();
	image.src = "images/rocketEnd";

	var width = 60,
		height = 60;
	

	// Getters and setters
	var getX = function() {
		return x;
	};

	var getY = function() {
		return y;
	};

	var isOnPlayer = function() {
		return onPlayer;
	};

	var setX = function(newX) {
		x = newX;
	};

	var setY = function(newY) {
		y = newY;
	};

	var setOn = function(newState) {
		onPlayer = newState;
	};

	var draw = function(ctx, localPlayer) {
		if (onPlayer == false){
			ctx.drawImage(image, 2000, canvas.height-600);
		}
		else if(localPlayer.objectId == this.id){

		}	
	};	

	var drawOn = function(ctx, imageX, imageY) {

	};	

	// Define which variables and methods can be accessed
	return {
		getX: getX,
		getY: getY,
		isOnPlayer: isOnPlayer,
		setX: setX,
		setY: setY,
		setOn: setOn,
		draw: draw,
		drawOn: drawOn,
		height: height,
		width: width,
		id: id
	}
};