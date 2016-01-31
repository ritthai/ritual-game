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

	module.getAliasFor = function(key){
		if (aliases[key] != null)
			return aliases[key];

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
	"celebrate": "celebrate (raise happiness of nearby followers)",
	"travel": "travel to the",
	"proselytize": "berate heathens (drop happiness of nearby enemy cult followers)",
	"salvage": "be productive (see Wisdom of the Ascended below)",
	"wander": "wander the lands",
	"morning": "In the morning",
	"evening": "In the evening",
	"afternoon": "In the afternoon",
	"atLocation": "If you visit the",
	"bird": "If you see a bird",
	"seeDeath": "If you see death",
	"cultMemberAt": "If you meet a follower of the",
};

var printMeters = function() {
	document.getElementById('meter-info').textContent =
		"Avg Food = " + utils.getAverageFood("player").toFixed(1) + ", " +
		"Avg Happiness = " + utils.getAverageHappy("player").toFixed(1) + ", " +
		"Followers = " + utils.getFollowerCount("player").toFixed(0);


}

var makeAtRandomPosition = function (callback, thirdVar) {
	callback(utils.getRandomX(), utils.getRandomY(), thirdVar);
};
