document.getElementById('join').addEventListener 'click', ->
  el = document.getElementById('joinGame')
  className = 'hidden'
  if el.classList
    el.classList.toggle className
  else
    classes = el.className.split(' ')
    existingIndex = classes.indexOf(className)
    if existingIndex >= 0
      classes.splice existingIndex, 1
    else
      classes.push className
    el.className = classes.join(' ')
  return
document.getElementById('joinFinal').addEventListener 'click', ->
  str = document.getElementById('code').value.substr(0, 5)
  gameId = str.replace(/[^a-zA-Z0-9\s[.]/g, '')
  window.location = '/join/' + gameId
  return