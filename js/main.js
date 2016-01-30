var SCREEN_WIDTH = 640;
var SCREEN_HEIGHT = 480;

var FrameRate = (1.0 / 30);

var rituals = {
	"player": [],
	"ai one": [],
	"ai two": [],
	"ai three": [],
};

var ais = {
	"player": "none",
	"ai one": "druid",
	"ai two": "necromancer",
	"ai three": "nymph",
};

var AIScripts = {
	"druid": {good:["grove", "stone circle", "marsh"], bad:["village", "graveyard", "fire pit"], rituals:
						[
						["morning", "", "gatherFood", ""],
						["afternoon", "", "travel", "good"],
						["atLocation", "bad", "wander", ""],
						["bird", "", "celebrate", ""],
						["evening", "", "celebrate", ""]]
						},
	
	"cleric": {good:["village", "farm", "grove"], bad:["firepit", "graveyard", "marsh"], rituals:
											[
											["morning", "", "travel", "good"],
											["morning", "", "salvage", ""],
											["afternoon", "", "gatherFood", ""],
											["afternoon", "", "salvage", ""],
											["evening", "", "salvage", ""]]
											},
											
	"nymph": {good:["firepit", "village", "grove"], bad:["marsh", "farm", "stone circle"], rituals:
						[
						["morning", "", "celebrate", ""],
						["afternoon", "", "celebrate", ""],
						["evening", "", "celebrate", ""],
						["seeDeath", "", "gatherFood", ""],
						["morning", "", "celebrate", ""]]
						},
						
	"necromancer": {good:["graveyard", "marsh", "village"], bad:["grove", "farm", "fire pit"], rituals:
						[
						["seeDeath", "", "travel", "good"],
						["atLocation", "good", "salvage", ""],
						["evening", "", "gatherFood", ""],
						["atLocation", "bad", "proselytize", ""],
						["bird", "", "wander", ""]]
						},
};

var conditionTypes = [
	"morning",
	"afternoon",
	"evening",
	"atLocation",
	"bird",
	"seeDeath"
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

var paused = true;

var makeUi = function () {
	var locations = [];
	for (var loc in LocationTypes) {
		locations.push(loc);
	}
	populateSelect(conditionTypes, 'condition-types');
	populateSelect(locations, 'condition-locations');
	populateSelect(actionTypes, 'action-types');
	populateSelect(locations, 'action-locations');
};

var populateSelect = function (list, id) {
	list.forEach(function (x) {
		var option = document.createElement('option');
		var content = document.createTextNode(x);
		option.appendChild(content);
		option.setAttribute('value', x);
		document.getElementById(id).appendChild(option);
	});
};

var uiAddRitual = function () {
	addRitual('player',
		document.getElementById('condition-types').value,
		document.getElementById('condition-locations').value,
		document.getElementById('action-types').value,
		document.getElementById('action-locations').value
		);
	addRitualAI("ai one");
	addRitualAI("ai two");
	addRitualAI("ai three");
	paused = false;
};

var addRitualAI = function(ai) {
	var aiScript = AIScripts[ais[ai]];
	var good = aiRunThroughList(aiScript["good"]);
	var bad = aiRunThroughList(aiScript["bad"]);
	
	var ritualOn = rituals[ai].length;
	
	if (rituals[ai].length >= aiScript["rituals"].length)
		return; //you're out of rituals to make
	
	var ritualSelection = aiScript["rituals"][ritualOn];
	
	addRitual(ai, ritualSelection[0], ritualSelection[1] == "good" ? good : bad, ritualSelection[2], ritualSelection[3] == "good" ? good : bad);
};

var aiRunThroughList = function(list) {
	for (var item in list)
		for (var loc in locations)
			if (locations[loc].locationType == list[item])
				return list[item];
	return "stone circle";
};

var uiClearRituals = function () {
	var list = rituals.player;
	list.splice(0, list.length);
};

var LocationSize = 120;
var LocationMaxWork = 30;

var birds = [];
var BirdSpeed = 300;


var DayLength = 30;
var dayTimer = 0;
var dayNumber = 1;

var foods = [];
var locations = [];

var timeOfDay = 'morning';

var addRitual = function (
	toCult,
	conditionType,
	conditionParam,
	actionType,
	actionParam
) {
	if (!paused)
		return;
	
	rituals[toCult].push({
		condition: {type: conditionType, param: conditionParam},
		action: {type: actionType, param: actionParam}
	});
};

var printPlayerRituals = function() {
	var text = 'PLAYER RITUALS:\n';
	rituals.player.forEach(function (ritual) {
		text += JSON.stringify(ritual) + '\n';
	});
	text += 'AI ONE RITUALS:\n';
	rituals["ai one"].forEach(function (ritual) {
		text += JSON.stringify(ritual) + '\n';
	});
	text += 'AI TWO RITUALS:\n';
	rituals["ai two"].forEach(function (ritual) {
		text += JSON.stringify(ritual) + '\n';
	});
	text += 'AI THREE RITUALS:\n';
	rituals["ai three"].forEach(function (ritual) {
		text += JSON.stringify(ritual) + '\n';
	});
	document.getElementById('rituals').textContent = text;
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
		makeFollowers();
		makeFoods();
		for (var i = 0; i < 3; i++)
			makeAtRandomPosition(makeBird, "");
		setTimeout(makeUi, 0);
	};

	var makeFollowers = function () {
		for (var i = 0; i < 15; i++)
			makeAtRandomPosition(makeFollower, "player");
		for (var i = 0; i < 30; i++)
			makeAtRandomPosition(makeFollower, "ai one");
		for (var i = 0; i < 45; i++)
			makeAtRandomPosition(makeFollower, "ai two");
		for (var i = 0; i < 60; i++)
			makeAtRandomPosition(makeFollower, "ai three");
	};

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

	var makeLocation = function (x, y, locationType) {
		var locWorks = {"player":0, "ai one":0, "ai two":0, "ai three":0};

		var newLoc = Crafty.e("2D, Canvas, Color")
			.attr({x:x, y:y, w:LocationSize, h:LocationSize, locationType:locationType, works:locWorks})
			.color(LocationTypes[locationType]["color"])
			.bind("EnterFrame", function(e) {
				if (locWorks["player"] + locWorks["ai one"] + locWorks["ai two"] + locWorks["ai three"] >= LocationMaxWork)
				{
					var awardWorkTo = null;
					if (locWorks["player"] >= locWorks["ai one"])
					{
						if (locWorks["player"] >= locWorks["ai two"])
						{
							if (locWorks["player"] >= locWorks["ai three"])
								awardWorkTo = "player";
							else
								awardWorkTo = "ai three";
						}
						else if (locWorks["ai two"] >= locWorks["ai three"])
							awardWorkTo = "ai two";
						else
							awardWorkTo = "ai three";
					}
					else
					{
						if (locWorks["ai one"] >= locWorks["ai two"])
						{
							if (locWorks["ai one"] >= locWorks["ai three"])
								awardWorkTo = "ai one";
							else
								awardWorkTo = "ai three";
						}
						else if (locWorks["ai two"] >= locWorks["ai three"])
							awardWorkTo = "ai two";
						else
							awardWorkTo = "ai three";
					}

					switch(locationType)
					{
					case "village":
						//get a free follower
						makeFollower(x + LocationSize / 2, y + LocationSize / 2, awardWorkTo);
						break;
					case "graveyard":
						//TODO: get a jewelry item
						break;
					case "firepit":
						//TODO: get a totem item
						break;
					default:
						//TODO: get a generic item
						break;
					}

					locWorks["player"] = 0;
					locWorks["ai one"] = 0;
					locWorks["ai two"] = 0;
					locWorks["ai three"] = 0;
				}
			});
		locations.push(newLoc);
	};

	var makeScreen = function () {
		Crafty.e("2D, Canvas, Color, Mouse, Tween")
			.color('rgb(150, 200, 200)')
			.attr({w:SCREEN_WIDTH, h:SCREEN_HEIGHT })
			.bind("MouseMove", function(e) {})
			.bind("MouseDown", function(e) {})
			.bind ("EnterFrame", function(e) {
				if (!paused)
				{
					dayTimer += FrameRate;
					updateTimeOfDay();
				}
				printMeters();
				printDebugInfo();
				printPlayerRituals();
			});

		var printDebugInfo = function () {
			if (!isDebugMode) { return; }
			var state = followers.map(function (x) { return x.getState(); });
			var json = JSON.stringify(state, null, 4);
			printToDebug(json);
		};

		var updateTimeOfDay = function () {
			if (dayTimer >= DayLength) {
				advanceDay();
			}
			if (dayTimer < DayLength / 3) {
				changeTimeOfDay('morning');
			} else if (dayTimer < DayLength * 2 / 3) {
				changeTimeOfDay('afternoon');
			} else {
				changeTimeOfDay('evening');
			}
		};

		var advanceDay = function () {
			dayTimer = 0;
			dayNumber += 1;
			makeFoods();
			paused = true;
		};

		var changeTimeOfDay = function (newTimeOfDay) {
			if (timeOfDay == newTimeOfDay) { return; }
			timeOfDay = newTimeOfDay;
			for (colorTime in timeColorBlocks) {
				var block = timeColorBlocks[colorTime];
				var alpha = colorTime == timeOfDay ? 1 : 0;
				block.tween({alpha: alpha}, 100);
			}
		};

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

	var makeFood = function (x, y, unused) {
		var food = Crafty.e("2D, Canvas, Color")
			.attr({x:x, y:y, w:10, h:10})
			.color("rgb(50, 200, 50)");
		foods.push(food);
	};

	var makeBird = function (x, y, unused) {
		var angle = Math.random() * Math.PI * 2;
		var bird = Crafty.e("2D, Canvas, Color")
			.attr({x:x, y:y, w:10, h:10})
			.color("rgb(240, 240, 240)")
			.bind("EnterFrame", function(e) {
				if (!paused)
				{
					bird.x += Math.cos(angle) * FrameRate * BirdSpeed;
					bird.y += Math.sin(angle) * FrameRate * BirdSpeed;
					if (bird.x < 0)
						bird.x += SCREEN_WIDTH;
					if (bird.x > SCREEN_WIDTH)
						bird.x -= SCREEN_WIDTH;
					if (bird.y < 0)
						bird.y += SCREEN_HEIGHT;
					if (bird.y > SCREEN_HEIGHT)
						bird.y -= SCREEN_HEIGHT;
				}
			});
		birds.push(bird);
	};

	init();
}());
