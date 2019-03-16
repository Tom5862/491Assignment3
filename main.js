
// GameBoard code below

function distance(a, b) {
    var dx = a.x - b.x;
    var dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
}

function randomMass(minMass, maxMass) {  
    var randomMass = Math.floor(Math.random() * (maxMass - minMass)) + minMass;
	return randomMass;
}

function Circle(game) {
    this.player = 1;
	this.mass = randomMass(5, 30);
    this.radius = this.mass * 2;
    this.visualRadius = this.radius * 50;
    this.colors = ["Red", "Green", "Blue", "Yellow"];
    this.setNotIt();
    Entity.call(this, game, this.radius + Math.random() * (800 - this.radius * 2), this.radius + Math.random() * (800 - this.radius * 2));

    this.velocity = { x: Math.random() * 1000, y: Math.random() * 1000 };
    var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
    if (speed > maxSpeed) {
        var ratio = maxSpeed / speed;
        this.velocity.x *= ratio;
        this.velocity.y *= ratio;
    }
};

Circle.prototype = new Entity();
Circle.prototype.constructor = Circle;

Circle.prototype.setIt = function () {
    this.it = true;
	if (this.mass >= 0 && this.mass < 15) {
		this.mass += 1;

	}
	if (this.mass >= 15 && this.mass < 20) {
		this.mass = randomMass(5, 30);
	}
	if (this.mass >= 20) {
		this.mass -= 1;	
	}
	this.radius = this.mass * 2;
    this.color = 0;
    this.visualRadius = this.radius * 50;
};

Circle.prototype.setNotIt = function () {
    this.it = false;
	if (this.mass >= 15 && this.mass < 20) {
		this.color = 1;
	}
	else if (this.mass >= 20) {
		this.color = 2;
	} else {
		this.color = 3;
	}
    
    this.visualRadius = this.radius * 20;
};

Circle.prototype.collide = function (other) {
    return distance(this, other) < this.radius + other.radius;
};

Circle.prototype.collideLeft = function () {
    return (this.x - this.radius) < 0;
};

Circle.prototype.collideRight = function () {
    return (this.x + this.radius) > 800;
};

Circle.prototype.collideTop = function () {
    return (this.y - this.radius) < 0;
};

Circle.prototype.collideBottom = function () {
    return (this.y + this.radius) > 800;
};

Circle.prototype.update = function () {
    Entity.prototype.update.call(this);
 //  console.log(this.velocity);

    this.x += this.velocity.x * this.game.clockTick;
    this.y += this.velocity.y * this.game.clockTick;

    if (this.collideLeft() || this.collideRight()) {
        this.velocity.x = -this.velocity.x * friction;
        if (this.collideLeft()) this.x = this.radius;
        if (this.collideRight()) this.x = 800 - this.radius;
        this.x += this.velocity.x * this.game.clockTick;
        this.y += this.velocity.y * this.game.clockTick;
    }

    if (this.collideTop() || this.collideBottom()) {
        this.velocity.y = -this.velocity.y * friction;
        if (this.collideTop()) this.y = this.radius;
        if (this.collideBottom()) this.y = 800 - this.radius;
        this.x += this.velocity.x * this.game.clockTick;
        this.y += this.velocity.y * this.game.clockTick;
    }

    for (var i = 0; i < this.game.entities.length; i++) {
        var ent = this.game.entities[i];
        if (ent !== this && this.collide(ent)) {
            var temp = { x: this.velocity.x, y: this.velocity.y };

            var dist = distance(this, ent);
            var delta = this.radius + ent.radius - dist;
            var difX = (this.x - ent.x)/dist;
            var difY = (this.y - ent.y)/dist;

            this.x += difX * delta / 2;
            this.y += difY * delta / 2;
            ent.x -= difX * delta / 2;
            ent.y -= difY * delta / 2;

            this.velocity.x = ent.velocity.x * friction;
            this.velocity.y = ent.velocity.y * friction;
            ent.velocity.x = temp.x * friction;
            ent.velocity.y = temp.y * friction;
            this.x += this.velocity.x * this.game.clockTick;
            this.y += this.velocity.y * this.game.clockTick;
            ent.x += ent.velocity.x * this.game.clockTick;
            ent.y += ent.velocity.y * this.game.clockTick;
            if (this.it) {
                this.setNotIt();
                ent.setIt();
            }
            else if (ent.it) {
                this.setIt();
                ent.setNotIt();
            }
        }

        if (ent != this && this.collide({ x: ent.x, y: ent.y, radius: this.visualRadius })) {
            var dist = distance(this, ent);
            if (this.it && dist > this.radius + ent.radius + 10) {
                var difX = (ent.x - this.x)/dist;
                var difY = (ent.y - this.y)/dist;
                this.velocity.x += difX * acceleration / (dist*dist);
                this.velocity.y += difY * acceleration / (dist * dist);
                var speed = Math.sqrt(this.velocity.x*this.velocity.x + this.velocity.y*this.velocity.y);
                if (speed > maxSpeed) {
                    var ratio = maxSpeed / speed;
                    this.velocity.x *= ratio;
                    this.velocity.y *= ratio;
                }
            }
            if (ent.it && dist > this.radius + ent.radius) {
                var difX = (ent.x - this.x) / dist;
                var difY = (ent.y - this.y) / dist;
                this.velocity.x -= difX * acceleration / (dist * dist);
                this.velocity.y -= difY * acceleration / (dist * dist);
                var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
                if (speed > maxSpeed) {
                    var ratio = maxSpeed / speed;
                    this.velocity.x *= ratio;
                    this.velocity.y *= ratio;
                }
            }
        }
    }


    this.velocity.x -= (1 - friction) * this.game.clockTick * this.velocity.x;
    this.velocity.y -= (1 - friction) * this.game.clockTick * this.velocity.y;
};

Circle.prototype.draw = function (ctx) {
    ctx.beginPath();
    ctx.fillStyle = this.colors[this.color];
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.closePath();

};
var dataArray = [];
var data2 = [];
var storedCircle = [];
//-------------------------------------------------------------------------------------
window.onload = function () {
  var socket = io.connect("http://24.16.255.56:8888");

  socket.on("load", function (data) {
      console.log(data);
//	  console.log(data.data.speed);
	  console.log(data.data.dataM[0][0]);
//	  dataArray[0].x = data.data.dataM[0];
//	  console.log(dataArray[0].x);
	var len = gameEngine.entities.length;
        for(var i = 0; i < len;i++) {
            gameEngine.entities.splice(0, 1);
        }
		
	if (data.length < 1) {
		alert("dont have data");
	} else {
		var circle = new Circle(gameEngine);
		storedCircle[0]= circle;
		storedCircle[0].setIt();
		storedCircle[0].x = data.data.dataM[0][0];
		storedCircle[0].y = data.data.dataM[0][1];
		storedCircle[0].velocity.x = data.data.dataM[0][2];
		storedCircle[0].velocity.y = data.data.dataM[0][3];
		storedCircle[0].mass = data.data.dataM[0][4];
		storedCircle[0].radius = data.data.dataM[0][5];
		storedCircle[0].visualRadius = data.data.dataM[0][6];
		storedCircle[0].color = data.data.dataM[0][7];
		gameEngine.addEntity(storedCircle[0]);
		dataArray[0] = [storedCircle[0].x,storedCircle[0].y,storedCircle[0].velocity.x,storedCircle[0].velocity.y,storedCircle[0].mass,storedCircle[0].radius,storedCircle[0].visualRadius,storedCircle[0].color];
		for (var i = 1; i < 13; i++) {
			circle = new Circle(gameEngine);
			storedCircle[i]= circle;
			storedCircle[i].x = data.data.dataM[i][0];
			storedCircle[i].y = data.data.dataM[i][1];
			storedCircle[i].velocity.x = data.data.dataM[i][2];
			storedCircle[i].velocity.y = data.data.dataM[i][3];
			storedCircle[i].mass = data.data.dataM[i][4];
			storedCircle[i].radius = data.data.dataM[i][5];
			storedCircle[i].visualRadius = data.data.dataM[i][6];
			storedCircle[i].color = data.data.dataM[i][7];
			gameEngine.addEntity(storedCircle[i]);
			dataArray[i] = [storedCircle[i].x,storedCircle[i].y,storedCircle[i].velocity.x,storedCircle[i].velocity.y,storedCircle[i].mass,storedCircle[i].radius,storedCircle[i].visualRadius,storedCircle[i].color];
		}
	}
  
	  
  });

  var text = document.getElementById("text");
  var saveButton = document.getElementById("save");
  var loadButton = document.getElementById("load");
  var runButton = document.getElementById("run");

  saveButton.onclick = function () {
    console.log("save");
    text.innerHTML = "Saved."
	dataArray = [];
	for (var i = 0; i < 12; i++ ) {
		dataArray[i] = [storedCircle[i].x,storedCircle[i].y,storedCircle[i].velocity.x,storedCircle[i].velocity.y,storedCircle[i].mass,storedCircle[i].radius,storedCircle[i].visualRadius,storedCircle[i].color];
	}
	
    socket.emit("save", { studentname: "Chris Marriott", statename: "aState", data: { dataM: dataArray} });
  };

  loadButton.onclick = function () {
    console.log("load");
    text.innerHTML = "Loaded."
    socket.emit("load", { studentname: "Chris Marriott", statename: "aState" });
  };
  runButton.onclick = function () {
	if(storedCircle.length < 2) {
		circleGeneration();
	}
  };

};

function circleGeneration() {
	if (dataArray.length < 1) {
		var circle = new Circle(gameEngine);
		circle.setIt();
		storedCircle[0]= circle;
		gameEngine.addEntity(storedCircle[0]);
		dataArray[0] = [storedCircle[0].x,storedCircle[0].y,storedCircle[0].velocity.x,storedCircle[0].velocity.y,storedCircle[0].mass,storedCircle[0].radius,storedCircle[0].visualRadius,storedCircle[0].color];
		for (var i = 1; i < 13; i++) {
			circle = new Circle(gameEngine);
			storedCircle[i]= circle;
			gameEngine.addEntity(storedCircle[i]);
			dataArray[i] = [storedCircle[i].x,storedCircle[i].y,storedCircle[i].velocity.x,storedCircle[i].velocity.y,storedCircle[i].mass,storedCircle[i].radius,storedCircle[i].visualRadius,storedCircle[i].color];
		}
	}
/*
	else {
		var circle = new Circle(gameEngine);
		storedCircle[0]= circle;
		storedCircle[0].setIt();
		storedCircle[0].x = dataArray[0];
		storedCircle[0].y = dataArray[0];
		storedCircle[0].velocity.x = dataArray[0];
		storedCircle[0].velocity.y = dataArray[0];
		storedCircle[0].mass = dataArray[0];
		storedCircle[0].radius = dataArray[0];
		storedCircle[0].visualRadius = dataArray[0];
		storedCircle[0].color = dataArray[0];
		gameEngine.addEntity(storedCircle[0]);
		dataArray[0] = [storedCircle[0].x,storedCircle[0].y,storedCircle[0].velocity.x,storedCircle[0].velocity.y,storedCircle[0].mass,storedCircle[0].radius,storedCircle[0].visualRadius,storedCircle[0].color];
		for (var i = 1; i < 13; i++) {
			circle = new Circle(gameEngine);
			storedCircle[i]= circle;
			storedCircle[i].x = dataArray[i];
			storedCircle[i].y = dataArray[i];
			storedCircle[i].velocity.x = dataArray[i];
			storedCircle[i].velocity.y = dataArray[i];
			storedCircle[i].mass = dataArray[i];
			storedCircle[i].radius = dataArray[i];
			storedCircle[i].visualRadius = dataArray[i];
			storedCircle[i].color = dataArray[i];
			gameEngine.addEntity(storedCircle[i]);
			dataArray[i] = [storedCircle[i].x,storedCircle[i].y,storedCircle[i].velocity.x,storedCircle[i].velocity.y,storedCircle[i].mass,storedCircle[i].radius,storedCircle[i].visualRadius,storedCircle[i].color];
		}
	}
	*/
}

//-------------------------------------------------------------------------------------

// the "main" code begins here
var friction = 1;
var acceleration = 1000000;
var maxSpeed = 200;
var gameEngine = new GameEngine();
var ASSET_MANAGER = new AssetManager();

ASSET_MANAGER.queueDownload("./img/960px-Blank_Go_board.png");
ASSET_MANAGER.queueDownload("./img/black.png");
ASSET_MANAGER.queueDownload("./img/white.png");

ASSET_MANAGER.downloadAll(function () {
    console.log("starting up da sheild");
    var canvas = document.getElementById('gameWorld');
    var ctx = canvas.getContext('2d');
    gameEngine.init(ctx);
    gameEngine.start();
});
