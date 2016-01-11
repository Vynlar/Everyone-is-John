window.socket = io()

GM = 0
PC = 1

socket.on "connect", () ->
  console.log "LOG: connected"

  socket.emit "join",
  # HACK:
    roomId: window.roomId
    type: GM
    userId: Cookies.get "userId"

document.getElementById("beginTest").addEventListener "click", (e) ->
  socket.emit "startBidding"
