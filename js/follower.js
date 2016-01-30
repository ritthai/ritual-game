var FollowerAIAction = {
	MOVE: 1,
	SING: 2,
	SEARCHFOOD: 3,
	PROCLAIM: 4,
	WORK: 5,
	NEUTRAL: 6
};

var FollowerSpeed = 400;

makeFollower = function () {
	//state variables
	var food = 100,
		happy = 100;
		aiState = FollowerAIAction.NEUTRAL,
		xTarget = 0,
		yTarget = 0;
	//follower constants
	var sprite = Crafty.e("2D, Canvas, Color")
		.color("green")
		.attr({x:10, y:10, w:20, h:20})
		.bind("EnterFrame", function(e){
			//TODO: AI logic
			sprite.x += 3;
			
			switch (aiState)
			{
			case FollowerAIAction.NEUTRAL:
				//get a new AI state
				//this can be based on 
				aiState = FollowerAIAction.MOVE;
				xTarget = 640 * Math.random();
				yTarget = 480 * Math.random();
				
				break;
			case FollowerAIAction.MOVE:
				//sometimes you will hit a ritual trigger while walking
				//birds, I guess?
				
				//walk there at constant speed
				var speedAdjusted = FollowerSpeed * e.dt / 1000;
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