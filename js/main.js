(function () {
	var SCREEN_WIDTH = 640,
		SCREEN_HEIGHT = 480;

	var init = function () {
		Crafty.init(SCREEN_WIDTH, SCREEN_HEIGHT);
		makeScreen();
	}

	var makeScreen = function () {
		Crafty.e("Screen, 2D, DOM, Color, Mouse")
			.color('rgb(150, 200, 200)')
			.attr({w:SCREEN_WIDTH, h:SCREEN_HEIGHT })
			.bind("MouseMove", function(e) {
			})
			.bind("MouseDown", function(e) {
			});
	};


	init();
}());
