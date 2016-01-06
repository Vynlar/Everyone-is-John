window.socket = io()
window.roomId = ""

GM = 0
PC = 1

socket.on "connect", ->
  console.log "LOG: connected to socket"

  username = Cookies.get "username"
  if !username?
    username = chance.name({middle: true, prefix: true})
    Cookies.set "username", username

  socket.emit "join",
    roomId: window.roomId
    type: PC
    userId: Cookies.get "userId"
    username: Cookies.get "username"

socket.on "startBidding", (data) ->
  console.log "LOG: Start Bidding"
  return

socket.on "stopBidding", (data) ->
  return

socket.on "willpower", (data) ->
  console.log "LOG: #{data.willpower}"
  setWillpower data.willpower
