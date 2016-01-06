var willpower = 8;
var lock = false, ln = -1, tmp = 10;
var bidButton = document.querySelector("#bidButton");

var drawSlider = function() {
	var slider = document.querySelector('#sliderButtons');
	console.log(slider.offsetHeight);
	var numButtons = (willpower > 10) ? willpower : 10;
	var height = slider.offsetHeight / (numButtons + 1);
	slider.innerHTML = "";
    if(willpower > 10) { tmp = willpower; }
	for(var i = 0; i <= tmp; i++) {
		var container = document.createElement('li');
		var button = document.createElement('a');
		
		container.style.height = height + "px";
		container.setAttribute('class', 'pixelbutton')
		
		button.innerText = tmp - i;
		button.setAttribute('class', 'button special');

        if(tmp - i > willpower) {
            button.style.background =  "rgb(171, 171, 171)";
            button.setAttribute('data-disabled', 'true');
        } else {
            var n = tmp - i;
            button.style.background = (function() {
                var hue=((1-(n / willpower))*120).toString(10);
                return ["hsl(",hue,",25%,50%)"].join("");
            })();
            button.setAttribute('data-disabled', 'false');
        }
		
		button.setAttribute('data-power', tmp - i);
		
		button.addEventListener('mouseenter', function() {
			if(lock || this.getAttribute('data-disabled') == 'true') return;
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
			if(lock || this.getAttribute('data-disabled') == 'true') return;
			for(var i = 0; i <= willpower; i++) {
				var n = willpower - i;
				document.querySelector('[data-power="' + i + '"]').style.background = (function() {
					var hue=((n / willpower)*120).toString(10);
					return ["hsl(",hue,",25%,50%)"].join("");
				})();
			}
		});
		
		button.addEventListener('click', function() {
            if(this.getAttribute('data-disabled') == 'true') return;
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
				document.querySelector('[data-power="' + i + '"]').style.background = (function() {
					var hue=((n / willpower)*120).toString(10);
					return ["hsl(",hue,",25%,50%)"].join("");
				})();
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