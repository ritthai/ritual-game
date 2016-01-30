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
