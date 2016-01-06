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
  document.getElementById("name").innerHTML = username

  socket.emit "join",
    roomId: window.roomId
    type: PC
    userId: Cookies.get "userId"
    username: Cookies.get "username"

socket.on "startBidding", (data) ->
  console.log "LOG: Start Bidding"
  document.getElementById("bidding").style.display = "block"
  document.getElementById("winner").innerHTML = ""

socket.on "stopBidding", (data) ->
  document.getElementById("winner").innerHTML = data.winner
  document.getElementById("bidding").style.display = "none"

socket.on "willpower", (data) ->
  console.log "LOG: #{data.willpower}"
  document.getElementById("willpower").innerHTML = data.willpower

###
Click Events
###
document.getElementById("bid").addEventListener "click", (e) ->
  bid = document.getElementById("bidField").value
  document.getElementById("bidField").value = null
  document.getElementById("bidding").style.display = "none"
  socket.emit "bid",
    bid: bid
