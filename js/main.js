

(function () {
	var SCREEN_WIDTH = 640,
		SCREEN_HEIGHT = 480,
		FOOD_COUNT = 30;

	var init = function () {
		Crafty.init(SCREEN_WIDTH, SCREEN_HEIGHT);

		makeScreen();
		makeFollower();
		makeFoods();
	}

	var makeScreen = function () {
		Crafty.e("Screen, 2D, Canvas, Color, Mouse")
			.color('rgb(150, 200, 200)')
			.attr({w:SCREEN_WIDTH, h:SCREEN_HEIGHT })
			.bind("MouseMove", function(e) {
			})
			.bind("MouseDown", function(e) {
			});
	};

	var makeFoods = function () {
		for (var i = 0; i < FOOD_COUNT; i++) {
			makeRandomFood();
		}
	};

	var makeRandomFood = function () {
		makeFood(
			Math.random() * SCREEN_WIDTH,
			Math.random() * SCREEN_HEIGHT);
	};

	var makeFood = function (x, y) {
		Crafty.e("2D, Canvas, Color")
			.attr({x:x, y:y, w:10, h:10})
			.color("rgb(50, 200, 50)");
	};

	init();
}());
