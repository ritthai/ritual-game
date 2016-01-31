var fade = function()
{
	var op = 1;
	var timer = setInterval(function () {
		if (op < 0.1)
		{
			clearInterval(timer);
			document.getElementById('splashscreen').hidden = true;
		}
		document.getElementById('splashimage').style.opacity = op;
		document.getElementById('splashimage').style.filter = 'alpha(opacity=' + (op * 100) + ')';
		op -= op * 0.1;
	}, 50);
}