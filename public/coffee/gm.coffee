window.socket = io()

GM = 0
PC = 1

currentWinner = ""
className = "won"

socket.on "connect", () ->
  console.log "LOG: connected"

  socket.emit "join",
  # HACK:
    roomId: window.roomId
    type: GM
    userId: Cookies.get "userId"

document.getElementById("beginTest").addEventListener "click", (e) ->
  winner = document.querySelector '[data-user-name="' + currentWinner + '"]'
  if winner?
    if (winner.classList)
      winner.classList.remove(className);
    else
      winner.className = winner.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ')
  socket.emit "startBidding"

document.getElementById("sleep").addEventListener "click", (e) ->
  socket.emit "sleep"

document.getElementById("gameName").innerText = roomId

window.updateWillpower = (id, amount) ->
  socket.emit "willpowerOverride", { id, amount }

socket.on "stopBidding", (data) ->
  winner = document.querySelector '[data-user-name="' + data.winner + '"]'
  if winner?
    currentWinner = data.winner
    if winner.classList
      winner.classList.add className
    else
      winner.className += ' ' + className