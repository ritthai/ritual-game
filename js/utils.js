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

var i = 0;
