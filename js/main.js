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
	"player": "hero",
	"ai one": "druid",
	"ai two": "necromancer",
	"ai three": "nymph",
};

var aiConvertHappyBuffs = {
	"player": 0,
	"ai one": 0,
	"ai two": 0,
	"ai three": 0,
};

var items = [];

var aiActRateBuffs = {
	"player": 1.0,
	"ai one": 1.0,
	"ai two": 1.0,
	"ai three": 1.0,
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
	"graveyard": {"color": "rgb(75, 75, 75)", "happyChange": -0.15, "foodChange": 0, "image": "images/grave.png"},
	"firepit": {"color": "rgb(200, 30, 40)", "happyChange": 0, "foodChange": -0.38, "image": "images/fire-place.png"},
	"grove": {"color": "rgb(30, 70, 30)", "happyChange": 0.15, "foodChange": 0, "image": "images/grove.png"},
	"farm": {"color": "rgb(150, 150, 30)", "happyChange": 0, "foodChange": 0.38, "image": "images/farm.png"},
	"stone circle": {"color": "rgb(100, 100, 100)", "happyChange": 0, "foodChange": 0, "image": "images/rocks.png"},
	"marsh": {"color": "rgb(60, 30, 10)", "happyChange": 0, "foodChange": 0, "image": "images/marsh.png"},
	"village": {"color": "rgb(100, 90, 30)", "happyChange": 0, "foodChange": 0, "image": "images/village.png"},
	"old manor": {"color": "rgb(130, 50, 20)", "happyChange": 0.038, "foodChange": 0.0938, "image": "images/manor.png"},
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
			textElements.push("You have gained " + (newPop - labelPopRecord).toFixed(0) + " followers since yesterday.");
		else if (newPop < labelPopRecord)
			textElements.push("You have lost " + (labelPopRecord - newPop).toFixed(0) + " followers since yesterday.");
		var followerCount = utils.getFollowerCount("player");
		var percentagePop = followerCount > 0 ? followerCount * 100 / followers.length : 0;
		textElements.push("You control " + percentagePop.toFixed(0) + "% of the population.");
		if (Math.abs(newFood - labelFoodRecord) > 0.1)
		{
			if (newFood < labelFoodRecord)
				textElements.push("Your followers have become " + (labelFoodRecord - newFood).toFixed(1) + "% hungrier since yesterday.");
			else
				textElements.push("Your followers have become " + (newFood - labelFoodRecord).toFixed(1) + "% more well-fed since yesterday.");
		}
		if (Math.abs(newHappy - labelHappyRecord) > 0.1)
		{
			if (newHappy < labelHappyRecord)
				textElements.push("Your followers have become " + (labelHappyRecord - newHappy).toFixed(1) + "% more miserable since yesterday.");
			else
				textElements.push("Your followers have become " + (newHappy - labelHappyRecord).toFixed(1) + "% happier since yesterday day.");
		}
		if (almostWinner != null && labelWinner === null)
			textElements.push((almostWinner == "player" ? "You" : "Enemy " + utils.getAliasFor(almostWinner)) + " will win in " + almostWinnerDay + " day" + (almostWinnerDay == 1 ? "" : "s") + "!");
		if (dayEvent == "heatwave")
			textElements.push("Looks like there's going to be a heat wave!");
		else if (dayEvent == "hysteria")
			textElements.push("You feel a great panic brewing up!");
		else if (dayEvent == "famine")
			textElements.push("You can see the crops withering!");
		else if (dayEvent == "miasma")
			textElements.push("You feel joyless somehow!");


		var text;
		if (labelWinner == null)
			text = "You survived to day " + dayNumber + "!";
		else if (labelWinner == "player")
			text = "You won on day " + labelWinnerDay + "!";
		else
			text = "You lost to " + utils.getAliasFor(labelWinner) + " on day " + labelWinnerDay + "!";
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
					textLabel.tween({alpha: 0}, 5000);
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
	populateSelect(conditionTypes, 'condition-types');
	populateSelect(actionTypes, 'action-types');
	makeUiCond();
	makeUiAct();

	var cults = [];
	for (var cult in ais) {
		cults.push(cult);
	}
	populateSelect(cults, 'follower-cult');


	//TODO: remove these! they're just for testing
	makeItem("stolen jewelry", "player");
	makeItem("wild totem", "player");
	makeItem("bag of food", "player");
	makeItem("bag of drugs", "player");
};

var resetItemListHTML = function() {
	document.getElementById('items').innerHTML = "";
	for (var i = 0; i < items.length; i++)
	{
		var itemListing = document.createElement("t");
		var item = document.createElement('button');
		itemListing.appendChild(item);
		var content = document.createTextNode(items[i]);
		item.appendChild(content);
		item.setAttribute('onclick', "useItem('" + items[i] + "','player'," + i + ")");
		itemListing.innerHTML += " ";
		switch(items[i])
		{
		case "stolen jewelry":
			itemListing.innerHTML += "The dead have no need for such cosmetics, but it will make our followers happy and attract the heathens to our cause."; //"RAISES HAPPY AND CONVERSION CHANCE";
			break;
		case "wild totem":
			itemListing.innerHTML += "Something about this totem that makes our hearts race and stomache calm. (Raises speed and food of followers)";
			break;
		case "bag of food":
			itemListing.innerHTML += "Our minds cannot ascend whilst our physical bodies still hunger. Sate our hunger so that we may rise.";//"RAISES FOOD";
			break;
		case "bag of drugs":
			itemListing.innerHTML += "The celebrations bring us joy, but there are other... ways to find happiness.";//"RAISES HAPPY";
			break;
		}
		itemListing.innerHTML += "<br/>";
		document.getElementById('items').appendChild(itemListing);
	}
};

var makeItem = function(type, cult) {
	if (cult == "player")
	{
		items.push(type);
		resetItemListHTML();
	}
	else
		useItem(type, cult, -1);
};

var useItem = function(type, cult, useID) {

	if (useID != -1)
	{
		items.splice(useID, 1);
		resetItemListHTML();
	}

	var feed = false;
	var joy = false;
	switch(type)
	{
	case "stolen jewelry":
		joy = true;
		aiConvertHappyBuffs[cult] += 10;
		break;
	case "wild totem":
		feed = true;
		aiActRateBuffs[cult] += 0.1;
		break;
	case "bag of food":
		feed = true;
		break;
	case "bag of drugs":
		joy = true;
		break;
	}

	followers.forEach(function (follower) {
		follower.useItem(cult, feed, joy);
	});
};

var makeUiCond = function() {
	var needLoc = false;
	var needAI = false;

	switch(document.getElementById('condition-types').value)
	{
	case "atLocation":
		needLoc = true;
		break;
	case "cultMemberAt":
		needAI = true;
		break;
	}

	document.getElementById('condition-locations').innerHTML = '';
	document.getElementById('condition-locations').hidden = false;

	if (needLoc)
	{
		var locations = [];
		for (var loc in LocationTypes) {
			locations.push(loc);
		}
		populateSelect(locations, 'condition-locations');
	}
	if (needAI)
		populateSelect(aiNames, 'condition-locations');

	if (!needAI && !needLoc)
	{
		document.getElementById('condition-locations').value = "";
		document.getElementById('condition-locations').hidden = true;
	}
};

var makeUiAct = function() {
	var needLoc = false;

	switch(document.getElementById('action-types').value)
	{
	case "travel":
		needLoc = true;
		break;
	}

	document.getElementById('action-locations').innerHTML = '';

	if (needLoc)
	{
		document.getElementById('action-locations').hidden = false;
		var locations = [];
		for (var loc in LocationTypes) {
			locations.push(loc);
		}
		populateSelect(locations, 'action-locations');
	}
	else
	{
		document.getElementById('action-locations').value = "";
		document.getElementById('action-locations').hidden = true;
	}
};

var populateSelect = function (list, id) {
	list.forEach(function (x) {
		var option = document.createElement('option');
		var content = document.createTextNode(utils.getAliasFor(x));
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
	startMusic();
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

	addRitual(ai, ritualSelection[0], ritualSelection[1] == "good" ? good : (ritualSelection[1] == "bad" ? bad : ""), ritualSelection[2], ritualSelection[3] == "good" ? good : ( ritualSelection[3] == "bad" ? bad : ""));
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
var dayEvent = null;

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

var ritualTranslate = function(ritual) {
	var text = utils.getAliasFor(ritual.condition.type);
	if (ritual.condition.param != "")
		text += " " + utils.getAliasFor(ritual.condition.param);
	text += ", " + utils.getAliasFor(ritual.action.type);
	if (ritual.action.param != "")
		text += " " + utils.getAliasFor(ritual.action.param);
	text += ".";
	return text;
};

var printPlayerRituals = function() {
	var text = 'Rituals of the ' + utils.getAliasFor("player") + ' (you):\n';
	rituals.player.forEach(function (ritual) {
		text += ritualTranslate(ritual) + '\n';
	});
	text += '\n';
	if (utils.getFollowerCount("ai one") > 0)
	{
		text += 'Rituals of the ' + utils.getAliasFor("ai one") + ':\n';
		rituals["ai one"].forEach(function (ritual) {
			text += ritualTranslate(ritual) + '\n';
		});
	}
	text += '\n';
	if (utils.getFollowerCount("ai two") > 0)
	{
		text += 'Rituals of the ' + utils.getAliasFor("ai two") + ':\n';
		rituals["ai two"].forEach(function (ritual) {
			text += ritualTranslate(ritual) + '\n';
		});
	}
	text += '\n';
	if (utils.getFollowerCount("ai three") > 0)
	{
		text += 'Rituals of the ' + utils.getAliasFor("ai three") + ':\n';
		rituals["ai three"].forEach(function (ritual) {
			text += ritualTranslate(ritual) + '\n';
		});
	}
	document.getElementById('rituals').textContent = text;
};

var printRituals = function() {
	var text = JSON.stringify(rituals, null, 4);
	console.log(text);
};

var setUpMusic = function () {
	Crafty.audio.add("backgroundMusic", [
		"audio/ggj-song.ogg",
		"audio/ggj-song.mp3"
	]);
	Crafty.audio.add("violin", [
		"audio/violin-ritual.ogg",
		"audio/violin-ritual.mp3"
	]);
	Crafty.audio.add("recorder", [
		"audio/ggj-recorder.ogg",
		"audio/ggj-recorder.mp3"
	]);
	Crafty.audio.add("food", [
		"audio/food-chime.ogg",
		"audio/food-chime.mp3"
	]);
	Crafty.audio.add("dnb", [
		"audio/dnb.ogg",
		"audio/dnb.mp3"
	]);
};

var startMusic = function () {
	if (dayNumber === 1) {
		Crafty.audio.play("backgroundMusic", 1);
	}
	if (dayNumber === 5) {
		Crafty.audio.play("violin", 1);
	}
};

var playFoodSound = function () {
	Crafty.audio.play("food", 1);
};

var playCelebrateSound = function () {
	if (!Crafty.audio.isPlaying("dnb")) {
		Crafty.audio.play("dnb", 1);
	}
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

		setUpMusic();
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

			food_count = 35;
			people_count = 30
			bird_count = 4;
			cult_count = 3;
			ais["ai one"] = "druid";
			ais["ai two"] = "necromancer";
			ais["ai three"] = "cleric";

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
			.attr({x:x, y:y, w:LocationSize, h:LocationSize, locationType:locationType, works:locWorks, death:false});
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
						//get a jewelry item
						makeItem("stolen jewelry", awardWorkTo);
						break;
					case "firepit":
						//get a totem item
						makeItem("wild totem", awardWorkTo);
						break;
					case "farm":
						makeItem("bag of food", awardWorkTo);
						break;
					default:
						//get a generic item
						if (Math.random() < 0.5)
							makeItem("bag of food", awardWorkTo);
						else
							makeItem("bag of drugs", awardWorkTo);
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
			.color('rgb(150, 200, 150)')
			.attr({w:SCREEN_WIDTH, h:SCREEN_HEIGHT })
			.bind("MouseMove", function(e) {})
			.bind("MouseDown", function(e) {})
			.bind ("EnterFrame", function(e) {
				if (!paused)
				{
					if (dayTimer == 0)
						makeFoods();
					dayTimer += FrameRate * (dayEvent == "miasma" ? 0.75 : 1);
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
				//random events
				var dayOfWeek = dayNumber % 7;
				if (dayOfWeek >= 3)
					dayEvent = null;
				else if (dayOfWeek == 0)
				{
					var rand = Math.floor(Math.random() * 4);
					switch(rand)
					{
					case 0:
						dayEvent = "miasma";
						break;
					case 1:
						dayEvent = "heatwave";
						break;
					case 2:
						dayEvent = "famine";
						break;
					case 3:
						dayEvent = "hysteria";
						break;
					}
				}
			}
			else
				dayEvent = null;

			//clear death from all locations
			for (var loc in locations)
				locations[loc].death = false;

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
				var alpha = (colorTime == timeOfDay || colorTime == dayEvent) ? timeColorBlocks[colorTime].maxAlpha : 0;
				block.tween({alpha: alpha}, 800);
			}
		};

		var timeColorBlocks = {
			"morning": makeTimeOfDayColorBlock('rgb(150, 200, 200)', 0),
			"afternoon": makeTimeOfDayColorBlock('rgb(200, 150, 50)', 0.8),
			"evening": makeTimeOfDayColorBlock('rgb(50, 50, 100)', 0.8),
			"heatwave": makeTimeOfDayColorBlock('rgb(250, 100, 25)', 0.3),
			"hysteria": makeTimeOfDayColorBlock('rgb(200, 175, 250)', 0.75),
			"famine": makeTimeOfDayColorBlock('rgb(220, 50, 50)', 0.65),
			"miasma": makeTimeOfDayColorBlock('rgb(125, 125, 125)', 0.8),
		};

		Crafty.e("2D, Canvas, Image")
			.attr({w:SCREEN_WIDTH, h:SCREEN_HEIGHT })
			.image('images/background.png')
			.attr({alpha: 0.5});
	};

	var makeTimeOfDayColorBlock = function (color, maxAlpha) {
		return Crafty.e("2D, Canvas, Color, Tween")
			.color(color)
			.attr({w:SCREEN_WIDTH, h:SCREEN_HEIGHT})
			.attr({maxAlpha:maxAlpha})
			.attr({alpha: 0});
	};

	var makeFoods = function () {
		if (dayEvent == "famine")
			return;
		for (var i = 0; i < food_count && foods.length < food_count * 1.5; i++) {
			makeAtRandomPosition(makeFood, "");
		}
	};

	var makeFood = function (x, y, unused) {
		var food = Crafty.e("2D, DOM, Image")
			.attr({x:x, y:y, w:10, h:10})
			.image('images/sundrop.png');
		foods.push(food);
	};

	var makeBird = function (x, y, unused) {
		var angle = Math.random() * Math.PI * 2;
		var bird = Crafty.e("2D, DOM, Image")
			.attr({x:x, y:y, w:10, h:10})
			.image("images/bird.png")
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
