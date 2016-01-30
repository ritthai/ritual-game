var FrameRate = (1.0 / 30);

(function () {
	var SCREEN_WIDTH = 640,
		SCREEN_HEIGHT = 480;

	var init = function () {
		Crafty.init(SCREEN_WIDTH, SCREEN_HEIGHT);
		makeScreen();
		makeFollower();
		makeFood();
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

	var makeFood = function () {
		Crafty.e("2D, Canvas, Color")
		.attr({x:100, y:100, w:10, h:10})
		.color("rgb(50, 200, 50)");
	};

	init();
}());
