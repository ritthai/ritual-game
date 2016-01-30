var FrameRate = (1.0 / 30);

var rituals = [];

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
};
var LocationSize = 120;

var foods = [];
var locations = [];

var addRitual = function (
	conditionType,
	conditionParam,
	actionType,
	actionParam
) {
	rituals.push({
		condition: {type: conditionType, param: conditionParam},
		action: {type: actionType, param: actionParam}
	});
};

var printRituals = function() {
	var text = JSON.stringify(rituals, null, 4);
	console.log(text);
};

(function () {
	var SCREEN_WIDTH = 640,
		SCREEN_HEIGHT = 480,
		FOOD_COUNT = 30;

	var init = function () {
		Crafty.init(SCREEN_WIDTH, SCREEN_HEIGHT);

		makeScreen();
		makeLocations();
		makeFollower();
		makeFoods();
	}
	
	var makeLocations = function () {
		//make a list of locations
		makeLocation(50, 50, "graveyard");
		makeLocation(300, 75, "lake");
	};
	
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
			});
	};

	var makeFoods = function () {
		for (var i = 0; i < FOOD_COUNT; i++) {
			makeRandomFood();
		}
	};

	var makeRandomFood = function () {
		makeFood(
			Math.random() * SCREEN_WIDTH,
			Math.random() * SCREEN_HEIGHT);
	};

	var makeFood = function (x, y) {
		var food = Crafty.e("2D, Canvas, Color")
			.attr({x:x, y:y, w:10, h:10})
			.color("rgb(50, 200, 50)");
		foods.push(food);
	};

	init();
}());