var SCREEN_WIDTH = 800;
var SCREEN_HEIGHT = 500;

var FrameRate = (1.0 / 30);

var rituals = {
	"player": [],
	"ai one": [],
	"ai two": [],
	"ai three": [],
};

var aiNames = [
	"player",
	"ai one",
	"ai two",
	"ai three"
];

var ais = {
	"player": "none",
	"ai one": "druid",
	"ai two": "necromancer",
	"ai three": "nymph",
};

var AIScripts = {
	"druid": {good:["grove", "stone circle", "marsh"], bad:["village", "graveyard", "firepit"], rituals:
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

	"necromancer": {good:["graveyard", "marsh", "village"], bad:["grove", "farm", "firepit"], rituals:
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
	"seeDeath",
	"cultMemberAt"
];

var actionTypes = [
	"gatherFood",
	"celebrate",
	"travel",
	"proselytize",
	"salvage",
	"wander"
];

var LocationTypes = {
	"graveyard": {"color": "rgb(75, 75, 75)", "happyChange": -0.15, "foodChange": 0},
	"firepit": {"color": "rgb(200, 30, 40)", "happyChange": 0, "foodChange": -0.38, "image": "images/fire-place.png"},
	"grove": {"color": "rgb(30, 70, 30)", "happyChange": 0.15, "foodChange": 0},
	"farm": {"color": "rgb(150, 150, 30)", "happyChange": 0, "foodChange": 0.38},
	"stone circle": {"color": "rgb(100, 100, 100)", "happyChange": 0, "foodChange": 0, "image": "images/rocks.png"},
	"marsh": {"color": "rgb(60, 30, 10)", "happyChange": 0, "foodChange": 0},
	"village": {"color": "rgb(100, 90, 30)", "happyChange": 0, "foodChange": 0},
	"old manor": {"color": "rgb(130, 50, 20)", "happyChange": 0.038, "foodChange": 0.0938},
};

var almostWinner = null;
var almostWinnerDay = 0;
var labelWinnerDay = 0;
var labelWinner = null;
var labelPopRecord = -1;
var labelHappyRecord = -1;
var labelFoodRecord = -1;
var labelDataTrack = function() {
	makeLabel(true);
};
var makeLabel = function(dontMake) {
	//track label values
	var newPop = utils.getFollowerCount("player");
	var newHappy = utils.getAverageHappy("player");
	var newFood = utils.getAverageFood("player");

	if (!dontMake)
	{
		//make the text for the label
		var textElements = [];
		if (newPop > labelPopRecord)
			textElements.push("You gained " + (newPop - labelPopRecord).toFixed(0) + " followers that day.");
		else if (newPop < labelPopRecord)
			textElements.push("You lost " + (labelPopRecord - newPop).toFixed(0) + " followers that day.");
		var percentagePop = utils.getFollowerCount("player") * 100 / followers.length;
		textElements.push("You control " + percentagePop.toFixed(0) + "% of the population.");
		if (Math.abs(newFood - labelFoodRecord) > 0.1)
		{
			if (newFood < labelFoodRecord)
				textElements.push("Your followers became " + (labelFoodRecord - newFood).toFixed(1) + "% hungrier that day.");
			else
				textElements.push("Your followers became " + (newFood - labelFoodRecord).toFixed(1) + "% more well-fed that day.");
		}
		if (Math.abs(newHappy - labelHappyRecord) > 0.1)
		{
			if (newHappy < labelHappyRecord)
				textElements.push("Your followers became " + (labelHappyRecord - newHappy).toFixed(1) + "% more miserable that day.");
			else
				textElements.push("Your followers became " + (newHappy - labelHappyRecord).toFixed(1) + "% happier that day.");
		}
		if (almostWinner != null)
			textElements.push((almostWinner == "player" ? "You" : "Enemy " + almostWinner) + " will win in " + almostWinnerDay + " day" + (almostWinnerDay == 1 ? "" : "s") + "!");

		var text;
		if (labelWinner == null)
			text = "You survived to day " + dayNumber + "!";
		else if (labelWinner == "player")
			text = "You won on day " + dayNumber + "!";
		else
			text = "You lost to " + labelWinner + " on day " + dayNumber + "!";
		if (textElements.length > 0)
			text += "<br/>" + textElements.join("<br/>");

		var textLabel = Crafty.e("2D, DOM, Text, CSS, Tween")
			.attr({x: 0, y: 40, w: SCREEN_WIDTH})
			.text(text)
			.textFont({size: "20px"})
			.unselectable()
			.css({"text-align": "center", "color": "white", "text-shadow": "0px 3px #000000"})
			.bind("EnterFrame", function(e) {
				if (!paused && textLabel.alpha == 1)
				{
					textLabel.alpha = 0.9999;
					textLabel.tween({alpha: 0}, 1000);
				}
				if (textLabel.alpha <= 0)
					textLabel.destroy();
			});
	}

	labelHappyRecord = newHappy;
	labelFoodRecord = newFood;
	labelPopRecord = newPop;
};

var paused = true;

var makeUi = function () {
	var locations = [];
	for (var loc in LocationTypes) {
		locations.push(loc);
	}
	populateSelect(conditionTypes, 'condition-types');
	populateSelect([''], 'condition-locations');
	populateSelect(locations, 'condition-locations');
	populateSelect(aiNames, 'condition-locations');
	populateSelect(actionTypes, 'action-types');
	populateSelect([''], 'action-locations');
	populateSelect(locations, 'action-locations');

	var cults = [];
	for (var cult in ais) {
		cults.push(cult);
	}
	populateSelect(cults, 'follower-cult');
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
	uiUnpauseInner();
};

var uiUnpauseInner = function () {
	document.getElementById('add-ritual-menu').style.display = 'none';
	paused = false;
	dayTimer = 0;
	if (!hasPlayedMusicOnce) {
		startMusic();
		hasPlayedMusicOnce = true;
	}
}
var uiUnpause = function () {
	addRitualAI("ai one");
	addRitualAI("ai two");
	addRitualAI("ai three");
	uiUnpauseInner();
};

var addRitualAI = function(ai) {
	if (labelWinner != null)
		return;

	if (almostWinner != null && almostWinner != ai)
	{
		//add an offensive ritual
		addRitual(ai, "cultMemberAt", almostWinner, "proselytize", "");
		return;
	}

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


var DayLength = 22;
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

var hasPlayedMusicOnce;

var startMusic = function () {
	Crafty.audio.add("backgroundMusic", [
		"audio/ggj-song.ogg",
		"audio/ggj-song.mp3"
	]);
	Crafty.audio.play("backgroundMusic", 1);
};

(function () {
	var food_count = 0;
	var people_count = 0;
	var bird_count = 0;
	var cult_count = 0;

	var init = function () {
		Crafty.init(SCREEN_WIDTH, SCREEN_HEIGHT);
		dayTimer = 0;
		makeScreen();
		makeLocations("moon island");
		makeFollowers();
		for (var i = 0; i < bird_count; i++)
			makeAtRandomPosition(makeBird, "");
		setTimeout(makeUi, 0);

		//initialize label data tracking
		labelDataTrack();

		hasPlayedMusicOnce = false;
	};

	var makeFollowers = function () {
		for (var i = 0; i < people_count / cult_count; i++)
			makeAtRandomPosition(makeFollower, "player");
		for (var i = 0; i < people_count / cult_count; i++)
			makeAtRandomPosition(makeFollower, "ai one");
		if (cult_count > 2)
			for (var i = 0; i < people_count / cult_count; i++)
				makeAtRandomPosition(makeFollower, "ai two");
		if (cult_count > 3)
			for (var i = 0; i < people_count / cult_count; i++)
				makeAtRandomPosition(makeFollower, "ai three");
	};

	var makeLocations = function (mapName) {
		//make a list of locations

		//MAP VARIANTS
		switch(mapName)
		{
		case "moon island":

			//the first real map
			//a symmetrical map for three cults

			food_count = 60;
			people_count = 30
			bird_count = 4;
			cult_count = 3;
			ais["ai one"] = "druid";
			ais["ai two"] = "necromancer";

			makeLocation(20, 45, "marsh");
			makeLocation(170, 110, "firepit");
			makeLocation(140, 240, "grove");

			makeLocation(340, 120, "stone circle");
			makeLocation(340, 280, "old manor");

			makeLocation(510, 110, "farm");
			makeLocation(540, 240, "village");
			makeLocation(660, 45, "graveyard");
			break;
		}
	};

	var makeLocation = function (x, y, locationType) {
		var locWorks = {"player":0, "ai one":0, "ai two":0, "ai three":0};

		var loc = LocationTypes[locationType];
		var newLoc;
		if (loc["image"]) {
			newLoc = Crafty.e("2D, Canvas, Image");
		} else {
			newLoc = Crafty.e("2D, Canvas, Color");
		}
		newLoc = newLoc
			.attr({x:x, y:y, w:LocationSize, h:LocationSize, locationType:locationType, works:locWorks});
		if (loc["image"]) {
			newLoc = newLoc.image(loc["image"]);
		} else {
			newLoc = newLoc.color(loc["color"]);
		}
		newLoc = newLoc
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
					if (dayTimer == 0)
						makeFoods();
					dayTimer += FrameRate;
					updateTimeOfDay();
				}
				printMeters();
				printDebugInfo();
				printPlayerRituals();
			});

		var printDebugInfo = function () {
			if (!isDebugMode) {
				printToDebug('');
				return;
			}
			var followerCult = document.getElementById('follower-cult').value;
			var state = followers
				.map(function (x) { return x.getState(); })
				.filter(function (x) { return x.cultIn === followerCult; });
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

			//detect victory or defeat
			if (labelWinner == null)
			{
				var instantWinner = utils.detectInstantWinner(cult_count);
				if (instantWinner != null)
				{
					//someone won!
					labelWinner = instantWinner;
					labelWinnerDay = dayNumber;
				}
				else
				{
					var leader = utils.detectLeader();
					if (leader != null)
					{
						if (leader == almostWinner)
						{
							almostWinnerDay -= 1;
							if (almostWinnerDay == 0)
							{
								labelWinner = almostWinner;
								labelWinnerDay = dayNumber;
								almostWinner = null;
							}
						}
						else
						{
							almostWinner = leader;
							almostWinnerDay = 3;
						}
					}
					else
						almostWinner = null;
				}
			}

			if (almostWinner == null)
			{
				//TODO: random events
			}

			dayNumber += 1;
			paused = true;
			makeLabel();
			if (document.getElementById('auto').checked || (labelWinner != null && labelWinner != "player"))
				uiUnpause();
			else if (labelWinner == null || labelWinner == "player")
				document.getElementById('add-ritual-menu').style.display = 'block';
			if (labelWinner != null && labelWinner != "player")
				document.getElementById('extra-ritual-menu').style.display = 'none';
		};

		var changeTimeOfDay = function (newTimeOfDay) {
			if (timeOfDay == newTimeOfDay) { return; }
			timeOfDay = newTimeOfDay;
			for (colorTime in timeColorBlocks) {
				var block = timeColorBlocks[colorTime];
				var alpha = colorTime == timeOfDay ? 1 : 0;
				block.tween({alpha: alpha}, 800);
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
		for (var i = 0; i < food_count && foods.length < food_count * 2; i++) {
			makeAtRandomPosition(makeFood, "");
		}
	};

	var makeFood = function (x, y, unused) {
		var food = Crafty.e("2D, Canvas, Image")
			.attr({x:x, y:y, w:10, h:10})
			.image('images/sundrop.png');
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
