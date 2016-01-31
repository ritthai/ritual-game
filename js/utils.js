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
	
	module.detectInstantWinner = function (cult_count) {
		var ai1 = getFollowerCount("ai one");
		var ai2 = getFollowerCount("ai two");
		var ai3 = getFollowerCount("ai three");
		if (getFollowerCount("player") == 0)
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

	return module;
}());

var printMeters = function() {
	document.getElementById('meter-info').textContent =
		"FOOD = " + utils.getAverageFood("player").toFixed(1) + ", " +
		"HAPPY = " + utils.getAverageHappy("player").toFixed(1) + ", " +
		"FOLLOWERS = " + utils.getFollowerCount("player").toFixed(0);

}

var makeAtRandomPosition = function (callback, thirdVar) {
	callback(utils.getRandomX(), utils.getRandomY(), thirdVar);
};