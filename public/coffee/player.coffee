window.socket = io()

GM = 0
PC = 1

###
window.setUsername = (username) ->
  if username?
    Cookies.set "username", username
    socket.emit 'changeUsername', { username: username }
###

username = Cookies.get "username"
if !username?
  username = chance.name({middle: true, prefix: true})
  Cookies.set "username", username

socket.on "connect", ->
  console.log "LOG: connected to socket"

  socket.emit "join",
    roomId: window.roomId
    type: PC
    userId: Cookies.get "userId"
    username: Cookies.get "username"

###
socket.on "startBidding", (data) ->
  console.log "LOG: Start Bidding"
  window.resetSlider()
  if window.started != true
    window.bidding = true
  else
    window.slideWillpower(false)
  return

socket.on "stopBidding", (data) ->
  # TODO: USE THE WINNER
  window.slideWillpower(true)
  if data.winner?
    console.log "LOG: Stop Bidding: #{data.winner}"
    window.toast({title: "#{data.winner} is in control!"})
  return

socket.on "willpower", (data) ->
  console.log "LOG: #{data.willpower} willpower"
  setWillpower data.willpower
###
