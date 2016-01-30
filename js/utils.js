var utils = (function (){
	var module = {};

	module.getRandomX = function () {
		return Math.random() * SCREEN_WIDTH;
	};

	module.getRandomY = function () {
		return Math.random() * SCREEN_HEIGHT;
	};
	
	module.getAverageHappy = function(forCult) {
		var ofCult = 0;
		var meter = 0;
		for (var follower in followers)
		{
			var happy = followers[follower].getHappy(forCult);
			if (happy > 0)
			{
				meter += happy;
				ofCult += 1;
			}
		}
		if (ofCult == 0)
			return 0;
		else
			return meter / ofCult;
	};
	
	module.getAverageFood = function(forCult) {
		var ofCult = 0;
		var meter = 0;
		for (var follower in followers)
		{
			var food = followers[follower].getFood(forCult);
			if (food > 0)
			{
				meter += food;
				ofCult += 1;
			}
		}
		if (ofCult == 0)
			return 0;
		else
			return meter / ofCult;
	};

	return module;
}());

var printMeters = function() {
	document.getElementById('meter-info').textContent;
	document.getElementById('meter-info').textContent = "FOOD = " + utils.getAverageFood("player").toFixed(1) + ", HAPPY = " + utils.getAverageHappy("player").toFixed(1);
}

var makeAtRandomPosition = function (callback, thirdVar) {
	callback(utils.getRandomX(), utils.getRandomY(), thirdVar);
};