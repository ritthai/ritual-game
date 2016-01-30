var utils = (function (){
	var module = {};

	module.getRandomX = function () {
		return Math.random() * SCREEN_WIDTH;
	};

	module.getRandomY = function () {
		return Math.random() * SCREEN_HEIGHT;
	};

	return module;
}());

var makeAtRandomPosition = function (callback, thirdVar) {
	callback(utils.getRandomX(), utils.getRandomY(), thirdVar);
};
