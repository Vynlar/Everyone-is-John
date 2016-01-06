var willpower = 10;
var lock = false, ln = -1;
var bidButton = document.querySelector("#bidButton");

var drawSlider = function() {
	var slider = document.querySelector('#sliderButtons');
	console.log(slider.offsetHeight);
	var height = slider.offsetHeight / (willpower + 1);
	slider.innerHTML = "";
	for(var i = 0; i <= willpower; i++) {
		var container = document.createElement('li');
		var button = document.createElement('a');
		
		container.style.height = height + "px";
		container.setAttribute('class', 'pixelbutton')
		
		button.innerText = willpower - i;
		button.setAttribute('class', 'button special');
		
		button.style.background = (function() {
			var hue=((i / willpower)*120).toString(10);
			return ["hsl(",hue,",25%,50%)"].join("");
		})();
		
		container.style.borderColor = (function() {
			var hue=((i / willpower)*120).toString(10);
			return ["hsl(",hue,",25%,20%)"].join("");
		})();
		
		button.setAttribute('data-power', willpower - i);
		
		button.addEventListener('mouseenter', function() {
			if(lock) return;
			for(var i = 0; i <= parseInt(this.getAttribute('data-power')); i++) {
				//var n = willpower - parseInt(this.innerText);
				var n = willpower - i;
				document.querySelector('[data-power="' + i + '"]').style.background = (function() {
					var hue=((n / willpower)*120).toString(10);
					return ["hsl(",hue,",75%,50%)"].join("");
				})();
			}
		});
		
		button.addEventListener('mouseleave', function() {
			if(lock) return;
			for(var i = 0; i <= willpower; i++) {
				var n = willpower - i;
				document.querySelector('[data-power="' + i + '"]').style.background = (function() {
					var hue=((n / willpower)*120).toString(10);
					return ["hsl(",hue,",25%,50%)"].join("");
				})();
			}
		});
		
		button.addEventListener('click', function() {
			//Clear
			for(var i = 0; i <= willpower; i++) {
				var n = willpower - i;
				document.querySelector('[data-power="' + i + '"]').style.background = (function() {
					var hue=((n / willpower)*120).toString(10);
					return ["hsl(",hue,",25%,50%)"].join("");
				})();
			}
			//Color and lock
			for(var i = 0; i <= parseInt(this.getAttribute('data-power')); i++) {
				//var n = willpower - parseInt(this.innerText);
				var n = willpower - i;
				document.querySelector('[data-power="' + i + '"]').style.background = (function() {
					var hue=((n / willpower)*120).toString(10);
					return ["hsl(",hue,",75%,50%)"].join("");
				})();
			}
			for(var i = parseInt(this.getAttribute('data-power')) + 1; i <= willpower; i++) {
				//var n = willpower - parseInt(this.innerText);
				var n = willpower - i;
				document.querySelector('[data-power="' + i + '"]').style.background =  "rgb(171, 171, 171)";
			}
			lock = true;
			bidButton.innerText = "Bid " + parseInt(this.getAttribute('data-power')) + " Willpower";
		});
		
		container.appendChild(button);
		slider.appendChild(container);
	}
};

document.addEventListener('DOMContentLoaded', function() {
	drawSlider();
});