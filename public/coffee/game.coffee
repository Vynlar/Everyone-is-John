document.addEventListener 'DOMContentLoaded', ->
  startButton = document.querySelector '#userStart'
  banner = document.querySelector '.gameStart'
  name = document.querySelector('#name')

  startButton.addEventListener 'click', ->
    #Do some update of the username here
    window.started = true
    setUsername name.value
    TweenMax.to banner, 0.5,
          ease: Sine.easeIn
          x: -window.innerWidth
    TweenMax.to startButton, 0.5,
          ease: Sine.easeIn
          x: window.innerWidth
          onComplete: ->
            if window.bidding == true
              window.slideWillpower(false)
