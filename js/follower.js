var FollowerSpeed = 200;
var FollowerSingTime = 4.0;
var FollowerWorkTime = 10.0;
var FollowerProclaimTime = 2.0;
var FollowerFoodDrain = 0.5;
var FollowerHappyDrain = 0.12;
var FollowerFoodGatherDistance = 30;

var FollowerSingBoost = 1;

var followers = [];

makeFollower = function () {
	//state variables
	var food = 100,
		happy = 100;
		aiState = "neutral",
		xTarget = 0,
		yTarget = 0,
		skillTimer = 0,
		cultNumber = 0;

	var follower = {};

	follower.feelJoyful = function() {
		happy += FollowerSingBoost;
	};

	follower.getState = function () {
		return {
			food: food,
			happy: happy,
			aiState: aiState,
			xTarget: xTarget,
			yTarget: yTarget,
			skillTimer: skillTimer,
			cultNumber: cultNumber
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

	//main loop
	var sprite = Crafty.e("2D, Canvas, Color")
		.color("green")
		.attr({x:10, y:10, w:20, h:20})
		.bind("EnterFrame", function(e){
			//necessities
			food -= FollowerFoodDrain * FrameRate;
			happy -= FollowerHappyDrain * FrameRate;

			//AI logic

			switch (aiState)
			{
			case "neutral":
				//get a new AI state
				//this can be based on

				// aiState = "travel";
				// xTarget = 640 * Math.random();
				// yTarget = 480 * Math.random();

				//TODO: seek out food!
				var nearFoodArray = nearestFood();
				xTarget = foods[nearFoodArray[0]].x;
				yTarget = foods[nearFoodArray[0]].y;
				aiState = "gatherFood";

				//TODO: check rituals list for rituals that are based on time, location, or proximity to people

				break;
			case "celebrate":
				skillTimer -= FrameRate;
				if (skillTimer <= 0) {
					followers.forEach(function (x) { x.feelJoyful() });
					aiState = "neutral";
				}
				break;
			case "proselytize":
				skillTimer -= FrameRate;
				if (skillTimer <= 0)
				{
					//you proclaimed
					//TODO: hurt everyone else's feelings
				}
				break;
			case "salvage":
				skillTimer -= FrameRate;
				if (skillTimer <= 0)
				{
					//you worked
					//TODO: bring about the fruits of your work
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
							yTarget = foods[nearFoodArray[1]].y;
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
