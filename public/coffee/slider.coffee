willpower = 10
lock = false
ln = -1
tmp = 10
currentBid = -1
bidButton = document.querySelector('#bidButton')

window.setWillpower = (willpower) ->
    @willpower = willpower
    drawSlider()
    
drawSlider = ->
  slider = document.querySelector('#sliderButtons')
  console.log slider.offsetHeight
  numButtons = if willpower > 10 then willpower else 10
  height = slider.offsetHeight / (numButtons + 1)
  slider.innerHTML = ''
  if willpower > 10
    tmp = willpower
  i = 0
  while i <= tmp
    container = document.createElement('li')
    button = document.createElement('a')
    container.style.height = height + 'px'
    container.setAttribute 'class', 'pixelbutton'
    button.innerText = tmp - i
    button.setAttribute 'class', 'button special'
    if tmp - i > willpower
      button.style.background = 'rgb(171, 171, 171)'
      button.setAttribute 'data-disabled', 'true'
    else
      n = tmp - i
      button.style.background = do ->
        hue = ((1 - (n / willpower)) * 120).toString(10)
        [
          'hsl('
          hue
          ',25%,50%)'
        ].join ''
      button.setAttribute 'data-disabled', 'false'
    button.setAttribute 'data-power', tmp - i
    button.addEventListener 'mouseenter', ->
      `var n`
      `var i`
      if lock or @getAttribute('data-disabled') == 'true'
        return
      i = 0
      while i <= parseInt(@getAttribute('data-power'))
        n = willpower - i
        document.querySelector('[data-power="' + i + '"]').style.background = do ->
          hue = (n / willpower * 120).toString(10)
          [
            'hsl('
            hue
            ',75%,50%)'
          ].join ''
        i++
      return
    button.addEventListener 'mouseleave', ->
      `var n`
      `var i`
      if lock or @getAttribute('data-disabled') == 'true'
        return
      i = 0
      while i <= willpower
        n = willpower - i
        document.querySelector('[data-power="' + i + '"]').style.background = do ->
          hue = (n / willpower * 120).toString(10)
          [
            'hsl('
            hue
            ',25%,50%)'
          ].join ''
        i++
      return
    button.addEventListener 'click', ->
      `var n`
      `var i`
      if @getAttribute('data-disabled') == 'true'
        return
      #Clear
      i = 0
      while i <= willpower
        n = willpower - i
        document.querySelector('[data-power="' + i + '"]').style.background = do ->
          `var n`
          `var i`
          hue = (n / willpower * 120).toString(10)
          [
            'hsl('
            hue
            ',25%,50%)'
          ].join ''
        i++
      #Color and lock
      while i <= parseInt(@getAttribute('data-power'))
        n = willpower - i
        document.querySelector('[data-power="' + i + '"]').style.background = do ->
          `var n`
          `var i`
          hue = (n / willpower * 120).toString(10)
          [
            'hsl('
            hue
            ',75%,50%)'
          ].join ''
        i++
      while i <= willpower
        n = willpower - i
        document.querySelector('[data-power="' + i + '"]').style.background = do ->
          hue = (n / willpower * 120).toString(10)
          [
            'hsl('
            hue
            ',25%,50%)'
          ].join ''
        i++
      lock = true
      currentBid = parseInt(@getAttribute('data-power'))
      bidButton.innerText = 'Bid ' + parseInt(@getAttribute('data-power')) + ' Willpower'
      return
    container.appendChild button
    slider.appendChild container
    i++
  return

denyBid = (bid) ->
    bid
  
document.addEventListener 'DOMContentLoaded', ->
  drawSlider()
  bidButton.addEventListener 'click', ->
    if currentBid < 0 or currentBid > willpower then denyBid currentBid
    socket.emit "bid",
        bid: currentBid
  return