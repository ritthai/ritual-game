var FollowerSpeed = 200;
var FollowerSingTime = 4.0;
var FollowerWorkTime = 10.0;
var FollowerProclaimTime = 2.0;
var FollowerFoodDrain = 0.5;
var FollowerHappyDrain = 0.15;
var FollowerFoodGatherDistance = 30;
var FollowerSingBoost = 2;
var FollowerProclaimPenalty = 2;
var FollowerLethargyMin = 0.5;
var FollowerLethargyMax = 6.0;
var FollowerMaxRandomWander = 100;

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
		if (locationAt == loc)
			happy += (cul == cultIn ? 1 : 0.5) * FollowerSingBoost;
	};

	follower.feelHurt = function(loc, cul) {
		if (locationAt == loc && cultIn != cul)
			happy -= FollowerProclaimPenalty;
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
			var nearestDist = 999999;
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

	//main loop
	var sprite = Crafty.e("2D, Canvas, Color")
		.color((startCult == "player" ? "green" : "red"))
		.attr({x:x, y:y, w:20, h:20})
		.bind("EnterFrame", function(e){
			//necessities
			food -= FollowerFoodDrain * FrameRate;
			happy -= FollowerHappyDrain * FrameRate;

			if (food <= 0)
			{
				//you starved!
				sprite.destroy();
				//TODO: remove from the followers list
				return;
			}
			if (happy <= 0)
			{
				//you converted!
				happy = 100;
				//TODO: switch to the cult with the highest average happiness (BESIDES your own)
				return;
			}
			
			if (locationAt != "none")
			{
				//location bonuses and penalties
				happy += LocationTypes[locationAt]["happyChange"] * FrameRate;
				food += LocationTypes[locationAt]["foodChange"] * FrameRate;
			}

			//AI logic

			switch (aiState)
			{
			case "neutral":
				getRealLocation();
				
				//check rituals list for rituals that are based on time, location, or proximity to people
				for (var ritual in rituals[cultIn])
				{
					//check the condition
					var conditionSuccess = false;
					var doOnce = false;
					switch(rituals[cultIn][ritual].condition.type)
					{
					case "morning":
						//is it morning?
						conditionSuccess = dayTimer <= DayLength / 3;
						doOnce = true;
						break;
					case "afternoon":
						//is it afternoon?
						conditionSuccess = dayTimer <= DayLength * 2 / 3 && dayTimer > DayLength / 3;
						doOnce = true;
						break;
					case "evening":
						//is it evening?
						conditionSuccess = dayTimer > DayLength * 2 / 3;
						doOnce = true;
						break;
					case "atLocation":
						//are you there?
						conditionSuccess = rituals[cultIn][ritual].condition.param == locationAt;
						break;
					}
					if (doOnce && followed.length > ritual && followed[ritual] == dayNumber)
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
							aiAction = "celebrate";
							skillTimer = FollowerSingTime;
							break;
						case "proselytize":
							aiAction = "proselytize";
							skillTimer = FollowerProclaimTime;
							break;
						case "salvage":
							aiAction = "salvage";
							skillTimer = FollowerWorkTime;
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
					//TODO: bring about the fruits of your work
					aiState = "neutral";
				}
				break;
			case "travel":
			case "gatherFood":

				//TODO: check rituals list for rituals that are based on location or proximity to moving things

				//walk there at constant speed
				var speedAdjusted = FollowerSpeed * FrameRate;
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

							foods[nearFoodArray[0]].destroy();
							foods.splice(nearFoodArray[0], 1);
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
				break;
			}
		});

};
