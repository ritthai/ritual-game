var isDebugMode = false;

var toggleDebugMode = function () {
	isDebugMode = !isDebugMode;
};

var printToDebug = function (message) {
	// document.getElementById('debug-info').textContent;
	document.getElementById('debug-info').textContent = message;//.join("\n");
};
