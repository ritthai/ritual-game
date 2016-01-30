var FrameRate = (1.0 / 30);

var rituals = {
	"player": [],
	"ai one": [],
	"ai two": [],
	"ai three": [],
};

var isDebugMode = false;

var toggleDebugMode = function () {
		isDebugMode = !isDebugMode;
};

var conditionTypes = [
"morning",
"afternoon",
"evening",
"atLocation"
];

var actionTypes = [
"gatherFood",
"celebrate",
"travel",
"proselytize",
"salvage"
];

var LocationTypes = {
	"graveyard": "rgb(75, 75, 75)",
	"lake": "rgb(40, 30, 200)",
	"grove": "rgb(30, 70, 30)",
};
var LocationSize = 120;

var DayLength = 50;
var dayTimer = 0;

var foods = [];
var locations = [];

var addRitual = function (
	toCult,
	conditionType,
	conditionParam,
	actionType,
	actionParam
) {
	rituals[toCult].push({
		condition: {type: conditionType, param: conditionParam},
		action: {type: actionType, param: actionParam}
	});
};

var printRituals = function() {
	var text = JSON.stringify(rituals, null, 4);
	console.log(text);
};

var utils = {};

(function () {
	var SCREEN_WIDTH = 640,
		SCREEN_HEIGHT = 480,
		FOOD_COUNT = 100;

	var init = function () {
		Crafty.init(SCREEN_WIDTH, SCREEN_HEIGHT);

		dayTimer = 0;

		makeScreen();
		makeLocations();
		makeFollower();
		for (var i = 0; i < 50; i++) {
			makeAtRandomPosition(makeFollower);
		}
		makeFoods();
		setInterval(function(){
			if (foods.length >= FOOD_COUNT) { return; }
			for (var i = 0; i < 20; i++) {
				makeAtRandomPosition(makeFood);
			}
		}, 300);

		addRitual('player', 'morning', '', 'wander', '');;
		addRitual('player', 'afternoon', '', 'gatherFood', '');
		addRitual('player', 'evening', '', 'travel', 'lake');
	}

	var makeLocations = function () {
		//make a list of locations
		makeLocation(50, 50, "graveyard");
		makeLocation(300, 75, "lake");
		makeLocation(20, 300, "grove");
	};

	//TODO: at the end of every day, before people issue new laws, make more food

	var makeLocation = function (x, y, locationType) {
		var newLoc = Crafty.e("2D, Canvas, Color")
			.attr({x:x, y:y, w:LocationSize, h:LocationSize, locationType:locationType})
			.color(LocationTypes[locationType]);
		locations.push(newLoc);
	}

	var makeScreen = function () {
		Crafty.e("Screen, 2D, Canvas, Color, Mouse")
			.color('rgb(150, 200, 200)')
			.attr({w:SCREEN_WIDTH, h:SCREEN_HEIGHT })
			.bind("MouseMove", function(e) {
			})
			.bind("MouseDown", function(e) {
			})
			.bind ("EnterFrame", function(e) {
				dayTimer += FrameRate;
				if (dayTimer >= DayLength)
					dayTimer = 0;

				if (isDebugMode) {
					var state = followers.map(function (x) { return x.getState(); });
					var json = JSON.stringify(state, null, 4);
					printToDebug(json);
				}
			});
	};

	var makeFoods = function () {
		for (var i = 0; i < FOOD_COUNT; i++) {
			makeAtRandomPosition(makeFood);
		}
	};

	var makeAtRandomPosition = function (callback) {
		callback(getRandomX(), getRandomY());
	};

	var makeFood = function (x, y) {
		var food = Crafty.e("2D, Canvas, Color")
			.attr({x:x, y:y, w:10, h:10})
			.color("rgb(50, 200, 50)");
		foods.push(food);
	};

	var getRandomX = function () {
		return Math.random() * SCREEN_WIDTH;
	};

	var getRandomY = function () {
		return Math.random() * SCREEN_HEIGHT;
	};

	utils.getRandomX = getRandomX;
	utils.getRandomY = getRandomY;

	init();
}());

var printToDebug = function (message) {
	document.getElementById('debug-info').textContent;
	document.getElementById('debug-info').textContent = message;
};
