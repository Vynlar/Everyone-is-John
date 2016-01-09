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

  window.toast = ({title, body}) ->
    toast = document.getElementById("toast")
    toast.getElementsByTagName("h1")[0].innerHTML = title
    toast.getElementsByTagName("p")[0].innerHTML = body
    toast.style.display = "block"
    setTimeout (->
      toast.style.display = "none"
    ), 5000
    toast.getElementsByTagName("a")[0].addEventListener "click", (e) ->
      toast.style.display = "none"
