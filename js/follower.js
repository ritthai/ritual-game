makeFollower = function () {
	var food = 100,
		happy = 100;
	var sprite = Crafty.e("2D, Canvas, Color")
		.color("green")
		.attr({x:10, y:10, w:20, h:20})
		.bind("EnterFrame", function(e){
			//TODO: AI logic
			sprite.x += 3;
		});

};