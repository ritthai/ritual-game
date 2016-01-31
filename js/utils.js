var utils = (function (){
	var module = {};

	module.getRandomX = function () {
		return Math.random() * SCREEN_WIDTH;
	};

	module.getRandomY = function () {
		return Math.random() * SCREEN_HEIGHT;
	};

	module.getAverageHappy = function(cult) {
		return getAverage(cult, function (x) { return x.getHappy(cult); });
	};

	module.getAverageFood = function(cult) {
		return getAverage(cult, function (x) { return x.getFood(cult); });
	};

	var getAverage = function (cult, callback) {
		var followers = getFollowersForCult(cult);
		var sum = followers.reduce(function (prev, cur) {
			return prev + callback(cur);
		}, 0);
		return followers.length > 0 ? sum / followers.length : 0;
	};

	module.getFollowerCount = function(cult) {
		return getFollowersForCult(cult).length;
	};

	var getFollowersForCult = function (cult) {
		return followers.filter(function (x) { return x.getCult() === cult; });
	};

	module.detectLeader = function () {
		//does anyone have enough people to have the needed majority?
		var ai1 = module.getFollowerCount("ai one");
		var ai2 = module.getFollowerCount("ai two");
		var ai3 = module.getFollowerCount("ai three");
		var player = module.getFollowerCount("player");
		var total = ai1 + ai2 + ai3 + player;
		var cultsAlive = (ai1 > 0 ? 1 : 0) + (ai2 > 0 ? 1 : 0) + (ai3 > 0 ? 1 : 0) + 1;
		var followersNeeded;
		switch(cultsAlive)
		{
		case 2:
			followersNeeded = total * 0.75;
			break;
		case 3:
			followersNeeded = total * 0.6;
			break;
		case 4:
			followersNeeded = total * 0.5;
			break;
		}
		if (ai1 > followersNeeded)
			return "ai one";
		if (ai2 > followersNeeded)
			return "ai two";
		if (ai3 > followersNeeded)
			return "ai three";
		if (player > followersNeeded)
			return "player";
		return null;
	};

	module.detectInstantWinner = function (cult_count) {
		var ai1 = module.getFollowerCount("ai one");
		var ai2 = module.getFollowerCount("ai two");
		var ai3 = module.getFollowerCount("ai three");
		if (module.getFollowerCount("player") == 0)
		{
			//there's an instant winner
			if (cult_count == 1)
				return "ai one";
			else if (cult_count == 2)
			{
				if (ai1 > ai2)
					return "ai one";
				return "ai two";
			}
			else
			{
				if (ai1 > ai2)
				{
					if (ai1 > ai3)
						return "ai one";
					return "ai three";
				}
				else if (ai2 > ai3)
					return "ai two";
				return "ai three";
			}
		}
		if (ai1 == 0 && ai2 == 0 && ai3 == 0)
			return "player";
		return null;
	}

	module.getAliasFor = function(key, extra){
		if (aliases[key] != null)
			return aliases[key] + (extra && aliasExtras[key] != null ? " " + aliasExtras[key] : "");

		//is it a cult?
		if (ais[key] != null)
			return ais[key];

		//it's a location I guess
		return key;
	};

	return module;
}());

var aliases = {
	"gatherFood": "search for food",
	"celebrate": "celebrate",
	"travel": "travel to the",
	"proselytize": "berate heathens",
	"salvage": "be productive",
	"wander": "wander the lands",
	"morning": "In the morning",
	"evening": "In the evening",
	"afternoon": "In the afternoon",
	"atLocation": "If you visit the",
	"bird": "If you see a bird",
	"seeDeath": "If you see death",
	"cultMemberAt": "If you meet a follower of the",
};

var aliasExtras = {
	"celebrate": "(raise happiness of nearby followers)",
	"proselytize": "(drop happiness of nearby enemy cult followers)",
	"salvage": "(see Wisdom of the Ascended below)",
}

var printMeters = function() {
	document.getElementById('meter-info').textContent =
		"Avg Food = " + utils.getAverageFood("player").toFixed(1) + ", " +
		"Avg Happiness = " + utils.getAverageHappy("player").toFixed(1) + ", " +
		"Followers = " + utils.getFollowerCount("player").toFixed(0);


}

var makeAtRandomPosition = function (callback, thirdVar) {
	callback(utils.getRandomX(), utils.getRandomY(), thirdVar);
};

var makeParticle = function(x, y, color, speed, friction, gravity, fallLength, lifetime, fadeLength)
{
	var angle = Math.random() * Math.PI / 3 + Math.PI / 4;
	var xSpeed = Math.cos(angle) * speed;
	var ySpeed = Math.sin(angle) * -speed;
	
	//get color
	if (color == "any")
	{
		var colorRoll = Math.floor(Math.random() * 5);
		switch(colorRoll)
		{
		case 0:
			color = "red";
			break;
		case 1:
			color = "blue";
			break;
		case 2:
			color = "green";
			break;
		case 3:
			color = "yellow";
			break;
		case 4:
			color = "pink";
			break;
		}
	}
	
	var part = Crafty.e("2D, Canvas, Color, Tween")
		.attr({x:x - 3 + Math.random() * 20, y:y - 3 + Math.random() * 20, w:6, h:6})
		.color(color)
		.bind("EnterFrame", function(e) {
			//move
			part.x += xSpeed * FrameRate;
			part.y += ySpeed * FrameRate;

			//apply friction
			if (friction > 0)
			{
				var frictReduce = friction * FrameRate;
				totalSpeed = Math.sqrt(xSpeed*xSpeed+ySpeed*ySpeed);
				if (frictReduce >= totalSpeed)
				{
					xSpeed = 0;
					ySpeed = 0;
				}
				else
				{
					xSpeed -= frictReduce * xSpeed / totalSpeed;
					ySpeed -= frictReduce * ySpeed / totalSpeed;
				}
			}

			//apply gravity
			ySpeed += gravity * FrameRate;

			//apply total fall length
			if (part.y >= y + fallLength)
			{
				xSpeed = 0;
				ySpeed = 0;
				part.y = y + fallLength;
			}

			//handle lifetime
			lifetime -= FrameRate;
			if (part.alpha == 1 && lifetime <= 0)
			{
				part.alpha = 0.999;
				part.tween({alpha: 0}, fadeLength * 1000);
			}
			else if (part.alpha <= 0)
				part.destroy();
		});
}