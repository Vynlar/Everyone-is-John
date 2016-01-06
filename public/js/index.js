var newGame = document.querySelector('#newGame');
var joinGameButton = document.querySelector('#joinGame');

var title = document.querySelector('#title');
var gameId = document.querySelector('#gameId');

var createNewGame = function() {
	if(newGame.getAttribute('data-action') == 'cancel') {
		TweenMax.to(gameId, 0.4, {ease: Sine.easeOut, y: gameId.offsetHeight * 2});
		TweenMax.to(title.parentNode, 0.4, {ease: Sine.easeOut, height: title.parentNode.offsetHeight / 2});
		newGame.innerText = "Create Game";
		TweenMax.to(title, 0.4, {
			ease: Sine.easeIn, 
			y: -title.parentNode.offsetHeight, 
			onComplete: function() {
				setTimeout(function() {
					title.querySelector('h2').innerText = "Everyone is John";
					TweenMax.to(title, 0.4, {ease: Sine.easeOut, y: 0});
					
					TweenMax.set(title.querySelector('h2'), { "padding-bottom": "0em" });
					
					
					joinGameButton.setAttribute('data-action', '');
					newGame.setAttribute('data-action', '');
				}, 150);
			}
		});
		return;
	}
	
	window.location = "game/create";
};

var joinGame = function() {
	if(joinGameButton.getAttribute('data-action') == 'start') {
		if(gameId.value != "") window.location = "game/" + gameId.value;
		return;
	}
	
	TweenMax.to(title, 0.4, {
		ease: Sine.easeIn, 
		y: -title.parentNode.offsetHeight, 
		onComplete: function() {
			setTimeout(function() {
				title.querySelector('h2').innerText = "Enter Game ID";
				TweenMax.to(title, 0.4, {ease: Sine.easeOut, y: 0});
				TweenMax.to(gameId, 0.4, {ease: Sine.easeOut, y: 0});
				TweenMax.set(title.querySelector('h2'), { "padding-bottom": "0.5em" })
				TweenMax.to(title.parentNode, 0.4, {ease: Sine.easeOut, height: title.parentNode.offsetHeight * 2});
				newGame.innerText = "Cancel";
				joinGameButton.setAttribute('data-action', 'start');
				newGame.setAttribute('data-action', 'cancel');
			}, 250);
		}
	});
	

};

document.addEventListener('DOMContentLoaded', function() { TweenMax.set(title.parentNode, {height: title.parentNode.offsetHeight / 2}); TweenMax.set(gameId, {y: gameId.offsetHeight}); });

newGame.addEventListener('click', createNewGame);
joinGameButton.addEventListener('click', joinGame);