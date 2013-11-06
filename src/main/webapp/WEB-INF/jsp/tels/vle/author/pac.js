
function updateLoading(){
	var num = Math.floor(Math.random()*16);
	if(num > 7){
		var newMsg = 'Thinking';
	} else {
		var newMsg = 'Loading';
	}

	/* set html text */
	//document.getElementById('coverTextUpdateDiv').innerHTML = newMsg;

	/* update the pacman */
	togglePacClass();

	/* shift pac images by ten pixels to the left */
	if(window.currentFullWidth <= 0){
		window.currentFullWidth = (window.totalPacWidth - (window.totalPacWidth % 50)) - 50;
	} else {
		window.currentFullWidth -= 10;
	}

	document.getElementById('fullDotsDiv').style.width = window.currentFullWidth;
	document.getElementById('flatDotsDiv').style.width = window.totalPacWidth - (window.currentFullWidth + 50);
}

/* initialize loading stuff here */
function initializeLoading(){
	/* set total width we'll be dealing with plus set initial pointer
	 * that stores the width of the fullDotsDiv */
	window.totalPacWidth = document.getElementById('coverImgDiv').offsetWidth - 6;

	/* round full width down to nearest 50 increment then subtract 50 for starting pac position */
	window.currentFullWidth = (window.totalPacWidth - (window.totalPacWidth % 50)) - 50;

	/* set width of initial pac elements */
	document.getElementById('fullDotsDiv').style.width = window.currentFullWidth;
	document.getElementById('pacDiv').style.width = 50;
	document.getElementById('flatDotsDiv').style.width = window.totalPacWidth - (window.currentFullWidth + 50);
	window.loadingInterval = setInterval('updateLoading()',300);
}

function togglePacClass(){
	var el = document.getElementById('pacDiv');
	if(el.className.indexOf('pacOpen')==-1){
		el.className = 'pacOpen';
	} else {
		el.className = 'pacClose';
	}
}