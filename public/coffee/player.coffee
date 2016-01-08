window.socket = io()

GM = 0
PC = 1

window.setUsername = (username) ->
  if username?
    Cookies.set "username", username
    socket.emit 'changeUsername', { username: username }

socket.on "connect", ->
  console.log "LOG: connected to socket"

  username = Cookies.get "username"
  if !username?
    username = chance.name({middle: true, prefix: true})
    Cookies.set "username", username
  #document.getElementById("name").innerHTML = username
  document.getElementById("name").value = username

  socket.emit "join",
    roomId: window.roomId
    type: PC
    userId: Cookies.get "userId"
    username: Cookies.get "username"

  console.log "LOG: emitted the join request"

socket.on "startBidding", (data) ->
  console.log "LOG: Start Bidding"
  window.slideWillpower(false)
  return

socket.on "stopBidding", (data) ->
  # TODO: USE THE WINNER
  window.slideWillpower(true)
  if data.willpower?
    console.log "LOG: Stop Bidding: #{data.winner}"
  return

socket.on "willpower", (data) ->
  console.log "LOG: #{data.willpower} willpower"
  setWillpower data.willpower
