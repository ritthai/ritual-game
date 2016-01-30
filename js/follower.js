var FollowerAIAction = {
	MOVE: 1,
	SING: 2,
	SEARCHFOOD: 3,
	PROCLAIM: 4,
	WORK: 5,
	NEUTRAL: 6
};

var FollowerSpeed = 200;
var FollowerSingTime = 4.0;
var FollowerWorkTime = 10.0;
var FollowerProclaimTime = 2.0;
var FollowerFoodDrain = 0.5;
var FollowerHappyDrain = 0.12;

makeFollower = function () {
	//state variables
	var food = 100,
		happy = 100;
		aiState = FollowerAIAction.NEUTRAL,
		xTarget = 0,
		yTarget = 0,
		skillTimer = 0,
		cultNumber = 0;
	//follower constants
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
			case FollowerAIAction.NEUTRAL:
				//get a new AI state
				//this can be based on 
				aiState = FollowerAIAction.MOVE;
				xTarget = 640 * Math.random();
				yTarget = 480 * Math.random();
				
				//TODO: check rituals list for rituals that are based on time, location, or proximity to people
				
				break;
			case FollowerAIAction.SING:
				skillTimer -= FrameRate;
				if (skillTimer <= 0)
				{
					//you sung
					//TODO: make everyone joyful
				}
				break;
			case FollowerAIAction.PROCLAIM:
				skillTimer -= FrameRate;
				if (skillTimer <= 0)
				{
					//you proclaimed
					//TODO: hurt everyone else's feelings
				}
				break;
			case FollowerAIAction.WORK:
				skillTimer -= FrameRate;
				if (skillTimer <= 0)
				{
					//you worked
					//TODO: bring about the fruits of your work
				}
				break;
			case FollowerAIAction.MOVE:
			case FollowerAIAction.SEARCHFOOD:
				
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
					
					//you've reached the destination, so you can return to being neutral
					aiState = FollowerAIAction.NEUTRAL;
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