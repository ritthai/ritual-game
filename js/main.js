var SCREEN_WIDTH = 640;
var SCREEN_HEIGHT = 480;

var FrameRate = (1.0 / 30);

var rituals = {
	"player": [],
	"ai one": [],
	"ai two": [],
	"ai three": [],
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
	"graveyard": {"color": "rgb(75, 75, 75)", "happyChange": -0.1, "foodChange": 0},
	"firepit": {"color": "rgb(200, 30, 40)", "happyChange": 0, "foodChange": -0.25},
	"grove": {"color": "rgb(30, 70, 30)", "happyChange": 0.1, "foodChange": 0},
	"farm": {"color": "rgb(150, 150, 30)", "happyChange": 0, "foodChange": 0.25},
	"stone circle": {"color": "rgb(100, 100, 100)", "happyChange": 0, "foodChange": 0},
	"marsh": {"color": "rgb(60, 30, 10)", "happyChange": 0, "foodChange": 0},
	"village": {"color": "rgb(100, 90, 30)", "happyChange": 0, "foodChange": 0},
};
var LocationSize = 120;

var DayLength = 50;
var dayTimer = 0;
var dayNumber = 1;

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

(function () {
	var FOOD_COUNT = 100;

	var init = function () {
		Crafty.init(SCREEN_WIDTH, SCREEN_HEIGHT);

		dayTimer = 0;

		makeScreen();
		makeLocations();
		for (var i = 0; i < 25; i++)
			makeAtRandomPosition(makeFollower, "player");
		for (var i = 0; i < 50; i++)
			makeAtRandomPosition(makeFollower, "ai one");
		makeFoods();
		setInterval(function(){
			if (foods.length >= FOOD_COUNT) { return; }
			for (var i = 0; i < 20; i++) {
				makeAtRandomPosition(makeFood, "");
			}
		}, 300);

		addRitual('player', 'morning', '', 'travel', 'graveyard');;
		addRitual('player', 'afternoon', '', 'gatherFood', '');
		addRitual('player', 'evening', '', 'travel', 'village');
		addRitual('player', 'atLocation', 'graveyard', 'wander', '');

		addRitual('ai one', 'evening', '', 'travel', 'graveyard');;
		addRitual('ai one', 'afternoon', '', 'gatherFood', '');
		addRitual('ai one', 'evening', '', 'gatherFood', '');
		addRitual('ai one', 'atLocation', 'village', 'travel', 'graveyard');;
	}

	var makeLocations = function () {
		//make a list of locations
		makeLocation(50, 25, "graveyard");
		makeLocation(75, 175, "village");
		makeLocation(25, 325, "grove");
		makeLocation(400, 25, "stone circle");
		makeLocation(425, 175, "firepit");
		makeLocation(325, 325, "marsh");
		makeLocation(225, 135, "farm");
	};

	//TODO: at the end of every day, before people issue new laws, make more food

	var makeLocation = function (x, y, locationType) {
		var newLoc = Crafty.e("2D, Canvas, Color")
			.attr({x:x, y:y, w:LocationSize, h:LocationSize, locationType:locationType})
			.color(LocationTypes[locationType]["color"]);
		locations.push(newLoc);
	}

	var makeScreen = function () {
		var timeOfDay = 'morning';

		Crafty.e("Screen, 2D, Canvas, Color, Mouse, Tween")
			.color('rgb(150, 200, 200)')
			.attr({w:SCREEN_WIDTH, h:SCREEN_HEIGHT })
			.bind("MouseMove", function(e) {
			})
			.bind("MouseDown", function(e) {
			})
			.bind ("EnterFrame", function(e) {
				dayTimer += FrameRate;

				if (dayTimer >= DayLength)
				{
					dayTimer = 0;
					dayNumber += 1;
				}

				if (dayTimer < DayLength / 3) {
					changeTimeOfDay('morning');
				} else if (dayTimer < DayLength * 2 / 3) {
					changeTimeOfDay('afternoon');
				} else {
					changeTimeOfDay('evening');
				}

				if (isDebugMode) {
					var state = followers.map(function (x) { return x.getState(); });
					var json = JSON.stringify(state, null, 4);
					printToDebug(json);
				}
			});

		var changeTimeOfDay = function (newTimeOfDay) {
			if (timeOfDay != newTimeOfDay) {
				timeOfDay = newTimeOfDay;
			}
			for (colorTime in timeColorBlocks) {
				var block = timeColorBlocks[colorTime];
				var alpha = colorTime == timeOfDay ? 1 : 0;
				block.tween({alpha: alpha}, 100);
			}
		}

		var timeColorBlocks = {
			"morning": makeTimeOfDayColorBlock('rgb(150, 200, 200)'),
			"afternoon": makeTimeOfDayColorBlock('rgb(200, 150, 50)'),
			"evening": makeTimeOfDayColorBlock('rgb(50, 50, 100)')
		};
	};

	var makeTimeOfDayColorBlock = function (color) {
		return Crafty.e("2D, Canvas, Color, Tween")
			.color(color)
			.attr({w:SCREEN_WIDTH, h:SCREEN_HEIGHT })
			.attr({alpha: 0});
	};

	var makeFoods = function () {
		for (var i = 0; i < FOOD_COUNT; i++) {
			makeAtRandomPosition(makeFood, "");
		}
	};

	var makeAtRandomPosition = function (callback, thirdVar) {
		callback(utils.getRandomX(), utils.getRandomY(), thirdVar);
	};

	var makeFood = function (x, y, unused) {
		var food = Crafty.e("2D, Canvas, Color")
			.attr({x:x, y:y, w:10, h:10})
			.color("rgb(50, 200, 50)");
		foods.push(food);
	};

	init();
}());
