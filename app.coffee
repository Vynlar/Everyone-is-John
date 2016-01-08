express = require "express"
app = express()
http = require("http").Server app
io = require("socket.io")(http)

###
ROOMS
###
rooms = []

class Room
  constructor: (roomId) ->
    @players = []
    @id = roomId
    @GM = null
    @bidding = true
  addPlayer: (player) ->
    @players.push player
  removeUser: (id) ->
    if @GM? && @GM.id == id
      @GM = null
      return
    index = -1
    for player, i in @players
      if player.id == id
        index = i
    if index != -1
      @players.splice index, 1
  setGM: (id, socket) ->
    @GM = {id: id, socket: socket}
  startBidding: () ->
    @bidding = true
    @emitToPlayers "startBidding"
  bid: (id, bid) ->
    if @bidding == false then return
    player = @findPlayer id
    player.makeBid bid
    @checkBids()
  checkBids: () ->
    console.log "checking bids"
    for player in @players
      if player.bid == null then return
    @processBids()
  processBids: () ->
    console.log "processing bids"
    highest = {bid: 0}
    ties = []
    for player in @players
      if player.bid > highest.bid
        highest = player
        ties = []
      if player.bid == highest.bid
        ties.push player
    if ties.length > 0
      ties.push highest
      i = Math.floor(Math.random() * ties.length)
      highest = ties[i]
    highest.spend highest.bid
    @bidding = false
    @resetPlayers()
    highest.socket.emit "willpower", {willpower: highest.willpower}
    @emitToAll "stopBidding", {winner: highest.username}
  emitToPlayers: (name, data) ->
    @eachPlayer (player) ->
      player.socket.emit name, data
  emitToGM: (name, data) ->
    if !@GM? then return
    @GM.socket.emit name, data
  emitToAll: (name, data) ->
    @emitToPlayers name, data
    @emitToGM name, data
  resetPlayers: () ->
    @eachPlayer (player) -> player.reset()
  findPlayer: (id) ->
    for player in @players
      if player.id == id
        return player
    return null
  eachPlayer: (op) ->
    for player, i in @players
      op player, i
  @create: (roomId) ->
    return new Room roomId

findRoom = (roomId) ->
  for room in rooms
    if room.id == roomId
      return room
  return null

###
PLAYER
###

#types
GM = 0
PC = 1

class Player
  constructor: (@socket, @id, @username) ->
    @bid = null
    @willpower = 10
  makeBid: (bid) ->
    if !@bid?
      @bid = bid
  spend: (value) ->
    if value > @willpower then return
    @willpower -= value
  changeUsername: (username) ->
    @username = username
  reset: () ->
    @bid = null

###
SOCKET CONNECTION
###
io.on "connection", (socket) ->
  roomId = ""
  id = ""

  socket.on "join", (data) ->
    roomId = data.roomId
    room = findRoom roomId
    type = data.type
    id = data.userId
    username = data.username

    socket.join roomId

    if !room?
      room = Room.create roomId
      rooms.push room

    if type == PC
      player = new Player socket, id, username
      room.addPlayer player
      player.socket.emit "willpower",
        willpower: player.willpower
    else
      room.setGM id, socket
    if type == GM then type = "GM" else type = "PLAYER"
    console.log "LOG: #{id} joined #{roomId} as #{type}"



  socket.on "bid", (data) ->
    console.log "bidded #{data.bid}"
    bid = data.bid
    room = findRoom roomId
    room.bid id, bid

  socket.on "startBidding", (data) ->
    room = findRoom roomId
    if room.GM.socket == socket
      room.startBidding()

  socket.on "changeUsername", (data) ->
    room = findRoom roomId
    player = room.findPlayer id
    if !player? then return
    player.changeUsername data.username

  socket.on "spend", (data) ->
    value = data.amount

  socket.on "disconnect", () ->
    room = findRoom roomId
    if !room? then return
    room.removeUser id
    console.log "LOG: #{id} left #{roomId}"

###
MIDDLEWARE
###
app.use express.static __dirname + "/public"
app.set 'views', './views'
app.set 'view engine', 'jade'

###
ROUTES
###

routes = require './routes/index'
app.use '/', routes

###
START SERVER
###
port = 3000
http.listen port, () ->
  console.log "Server started on " + port
