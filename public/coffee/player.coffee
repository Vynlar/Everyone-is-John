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

socket.on "startBidding", (data) ->
  console.log "LOG: Start Bidding"
  window.slideWillpower(true)
  return

socket.on "stopBidding", (data) ->
  # TODO: USE THE WINNER
  console.log "LOG: Start Bidding"
  window.slideWillpower()
  return

socket.on "willpower", (data) ->
  console.log "LOG: #{data.willpower}"
  setWillpower data.willpower
