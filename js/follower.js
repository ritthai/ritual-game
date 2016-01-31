var FollowerSpeed = 200;
var FollowerSpeedStarving = 75;
var FollowerSingTime = 2.5;
var FollowerWorkTime = 6.0;
var FollowerProclaimTime = 1.2;
var FollowerFoodDrain = 0.85;
var FollowerHappyDrain = 0.3;
var FollowerHungryHappyDrain = 0.2;
var FollowerFoodGatherDistance = 30;
var FollowerSingBoost = 1;
var FollowerProclaimPenalty = 1;
var FollowerLethargyMin = 0.5;
var FollowerLethargyMax = 6.0;
var FollowerMaxRandomWander = 100;
var FollowerBirdDistance = 70;

var followers = [];

makeFollower = function (x, y, startCult) {
	//state variables
	var food = 100;
	var happy = 100;
	var aiState = "neutral";
	var xTarget = 0;
	var yTarget = 0;
	var skillTimer = 0;
	var cultIn = startCult;
	var locationAt = "none";
	var lethargy = -1;

	var follower = {};

	var followed = [];

	follower.feelJoyful = function(loc, cul) {
		if (locationAt == loc && dayEvent != "miasma")
		{
			happy += (cul == cultIn ? 1 : 0.15) * FollowerSingBoost;
			if (happy > 100)
				happy = 100;
		}

	};

	follower.feelHurt = function(loc, cul) {
		if (locationAt == loc && cultIn != cul)
			happy -= FollowerProclaimPenalty;
	};

	follower.getHappy = function(cul) {
		if (cul == cultIn)
			return happy;
		return 0;
	}

	follower.getFood = function(cul) {
		if (cul == cultIn)
			return food;
		return 0;
	}

	follower.getCult = function() {
		return cultIn;
	};

	follower.getState = function () {
		return {
			food: food,
			happy: happy,
			aiState: aiState,
			xTarget: xTarget,
			yTarget: yTarget,
			skillTimer: skillTimer,
			locationAt: locationAt,
			cultIn: cultIn
		};
	};

	followers.push(follower);

	//helper functions
	var nearestFood = function () {
		var nearest = -1;
		var nearestDist = 0;
		for (var food in foods)
		{
			var xD = sprite.x - foods[food].x;
			var yD = sprite.y - foods[food].y;
			var dist = Math.sqrt(xD*xD+yD*yD);
			if (nearest == -1 || dist < nearestDist)
			{
				nearest = food;
				nearestDist = dist;
			}
		}
		return [nearest, nearestDist];
	};
	var getRealLocation = function() {
		if (locationAt == "none")
		{
			var nearestDist = Infinity;
			for (var loc in locations)
			{
				var xD = sprite.x - locations[loc].x - (LocationSize / 2);
				var yD = sprite.y - locations[loc].y - (LocationSize / 2);
				var dist = Math.sqrt(xD*xD+yD*yD);
				if (dist < nearestDist)
				{
					locationAt = locations[loc].locationType;
					nearestDist = dist;
				}
			}
		}
	}
	
	follower.inCultAtPlace = function (cul, loc) {
		return cultIn == cul && locationAt == loc;
	}
	
	var checkLocationForCult = function (cul) {
		for (var fol in followers)
			if (followers[fol].inCultAtPlace(cul, locationAt))
				return true;
		return false;
	};

	var getCultColor = function (cult) {
		return (cult == "player" ? "green" : (cult == "ai one" ? "purple" : (cult == "ai two" ? "blue" : "red")));
	};

	var handleNecessities = function () {
		food -= FollowerFoodDrain * (dayEvent == "heatwave" ? 2 : 1) * FrameRate;
		happy -= FollowerHappyDrain * (dayEvent == "hysteria" ? 3 : 1) * FrameRate;
		if (food < 50)
			happy -= FollowerHungryHappyDrain * FrameRate;
		if (food <= 0) {
			// you starved!
			sprite.destroy();
			followers.splice(followers.indexOf(follower), 1); // remove from list

			//mark your location with death
			for (var loc in locations)
				if (locations[loc].locationType == locationAt)
					locations[loc].death = true;
			
			return;
		}
		if (happy <= 0)
		{
			// you converted! switch to happiest cult that's not yours
			happy = 100;
			cultIn = getHappiestOtherCult();
			sprite.color(getCultColor(cultIn));
			return;
		}
	};

	var applyLocationBonusAndPenalties = function () {
		if (locationAt === "none") { return; }
		var loc = LocationTypes[locationAt];
		happy += loc["happyChange"] * FrameRate;
		food += loc["foodChange"] * FrameRate;
	};

	var getHappiestOtherCult = function () {
		var cults = ['player', 'ai one', 'ai two', 'ai three'];
		var bestOtherCult = '';
		cults.forEach(function (x) {
			if (cultIn !== x && utils.getAverageHappy(x) > utils.getAverageHappy(bestOtherCult)) {
				bestOtherCult = x;
			}
		});
		return bestOtherCult;
	};
	
	var checkRitualInner = function(doOnceOnly) {
		//check rituals list for rituals that are based on time, location, or proximity to people
		for (var ritual in rituals[cultIn])
		{
			//check the condition
			var conditionSuccess = false;
			switch(rituals[cultIn][ritual].condition.type)
			{
			case "morning":
				//is it morning?
				if (doOnceOnly)
					conditionSuccess = dayTimer <= DayLength / 3;
				break;
			case "afternoon":
				//is it afternoon?
				if (doOnceOnly)
					conditionSuccess = dayTimer <= DayLength * 2 / 3 && dayTimer > DayLength / 3;
				break;
			case "evening":
				//is it evening?
				if (doOnceOnly)
					conditionSuccess = dayTimer > DayLength * 2 / 3;
				break;
			case "atLocation":
				//are you there?
				conditionSuccess = rituals[cultIn][ritual].condition.param == locationAt;
				break;
			case "bird":
				//is there... a bird nearby?
				if (doOnceOnly)
					for (var bird in birds)
					{
						var xD = birds[bird].x - sprite.x;
						var yD = birds[bird].y - sprite.y;
						var dist = Math.sqrt(xD*xD+yD*yD)
						if (dist < FollowerBirdDistance)
						{
							conditionSuccess = true; //you DID see a bird! oh my god! etc etc
							break;
						}
					}
				break;
			case "seeDeath":
				//did someone die in your current location?
				if (doOnceOnly)
					for (var loc in locations)
						if (locations[loc].locationType == locationAt && locations[loc].death)
						{
							conditionSuccess = true;
							break;
						}
				break;
			case "cultMemberAt":
				//is there someone of that cult here?
				if (doOnceOnly)
					conditionSuccess = checkLocationForCult(rituals[cultIn][ritual].condition.param);
				break;
			}
			if (doOnceOnly && followed.length > ritual && followed[ritual] == dayNumber)
				conditionSuccess = false;

			if (conditionSuccess)
			{
				switch(rituals[cultIn][ritual].action.type)
				{
				case "gatherFood":
					//is there food?
					var nearFoodArray = nearestFood();
					if (nearFoodArray[0] != -1)
					{
						xTarget = foods[nearFoodArray[0]].x;
						yTarget = foods[nearFoodArray[0]].y;
						aiState = "gatherFood";
						locationAt = "none";
						break;
					}
					break;
				case "travel":
					//get the location of the given position
					if (locationAt != rituals[cultIn][ritual].action.param)
					{
						for (var loc in locations)
						{
							if (locations[loc].locationType == rituals[cultIn][ritual].action.param)
							{
								xTarget = locations[loc].x + Math.random() * LocationSize;
								yTarget = locations[loc].y + Math.random() * LocationSize;
								aiState = "travel";
								locationAt = "none";
								break;
							}
						}
					}
					break;
				case "wander":
					xTarget = utils.getRandomX();
					yTarget = utils.getRandomY();
					aiState = "travel";
					locationAt = "none";
					break;
				case "celebrate":
					getRealLocation();
					aiState = "celebrate";
					skillTimer = FollowerSingTime;
					break;
				case "proselytize":
					getRealLocation();
					aiState = "proselytize";
					skillTimer = FollowerProclaimTime;
					break;
				case "salvage":
					getRealLocation();
					aiState = "salvage";
					skillTimer = FollowerWorkTime;
					break;
				default:
					console.log("ERROR: unknown result " + rituals[cultIn][ritual].action.type);
					break;
				}
			}

			if (aiState != "neutral")
			{
				//register this ritual as followed
				followed[ritual] = dayNumber;

				break; //stop checking
			}
		}
	}

	var handleAiNeutral = function () {
		getRealLocation();

		checkRitualInner(true);
		if (aiState == "neutral")
			checkRitualInner(false);
		
		if (aiState == "neutral")
		{
			//there are no rituals to follow
			//so wander somewhere at random

			if (lethargy == -1)
				lethargy = (FollowerLethargyMax - FollowerLethargyMin) * Math.random() + FollowerLethargyMin;
			else
			{
				lethargy -= FrameRate;
				if (lethargy <= 0)
				{
					lethargy = -1;
					xTarget = sprite.x + FollowerMaxRandomWander * 2 * Math.random() - FollowerMaxRandomWander;
					yTarget = sprite.y + FollowerMaxRandomWander * 2 * Math.random() - FollowerMaxRandomWander;
					aiState = "travel";
					locationAt = "none";
				}
			}
		}
	};

	//main loop
	var sprite = Crafty.e("2D, Canvas, Color")
		.color(getCultColor(startCult))
		.attr({x:x, y:y, w:20, h:20})
		.bind("EnterFrame", function(e){
			if (paused) return;

			handleNecessities();
			applyLocationBonusAndPenalties();

			//AI logic
			switch (aiState)
			{
			case "neutral":
				handleAiNeutral();
				break;
			case "celebrate":
				skillTimer -= FrameRate;
				if (skillTimer <= 0) {
					followers.forEach(function (x) { x.feelJoyful(locationAt, cultIn) });
					aiState = "neutral";
				}
				break;
			case "proselytize":
				skillTimer -= FrameRate;
				if (skillTimer <= 0) {
					//you proclaimed
					followers.forEach(function (x) { x.feelHurt(locationAt, cultIn) });
					aiState = "neutral";
				}
				break;
			case "salvage":
				skillTimer -= FrameRate;
				if (skillTimer <= 0) {
					//you worked
					for (var loc in locations)
						if (locations[loc].locationType == locationAt)
							locations[loc].works[cultIn] += 1;
					aiState = "neutral";
				}
				break;
			case "travel":
			case "gatherFood":
				aiTravelGatherFood();
				break;
			}
		});

	var aiTravelGatherFood = function () {
		//TODO: check rituals list for rituals that are based on location or proximity to moving things

		//walk there at constant speed
		var speedAdjusted = ((FollowerSpeed - FollowerSpeedStarving) * food * 0.01 + FollowerSpeedStarving) * FrameRate * (dayEvent == "hysteria" ? 2.5 : 1) * (dayEvent == "miasma" ? 0.5 : 1);
		var xDif = xTarget - sprite.x;
		var yDif = yTarget - sprite.y;
		var dif = Math.sqrt(xDif*xDif+yDif*yDif);

		if (dif <= speedAdjusted)
		{
			sprite.x = xTarget;
			sprite.y = yTarget;

			if (aiState == "gatherFood")
			{
				//TODO: pick up food near your location
				//or try again if it's all gone
				var nearFoodArray = nearestFood();
				if (nearFoodArray[0] == -1)
				{
					//give up on getting food, it doesn't exist
					aiState = "neutral";
				}
				if (nearFoodArray[1] <= FollowerFoodGatherDistance)
				{
					//you found food!
					food = 100;
					aiState = "neutral";

					if (nearFoodArray[0] != -1) {
						foods[nearFoodArray[0]].destroy();
						foods.splice(nearFoodArray[0], 1);
					}
				}
				else
				{
					//go to that food
					xTarget = foods[nearFoodArray[0]].x;
					yTarget = foods[nearFoodArray[0]].y;
				}
			}
			else
			{
				//you've reached the destination, so you can return to being neutral
				aiState = "neutral";
			}
		}
		else
		{
			sprite.x += speedAdjusted * xDif / dif;
			sprite.y += speedAdjusted * yDif / dif;
		}
	};

};
