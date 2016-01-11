express = require "express"
app = express()
http = require("http").Server app
io = require("socket.io")(http)
_ = require "underscore"

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
      player.left = true
      players = @players
      setTimeout (->
        if player.left == true
          players.splice index, 1
          console.log "LOG: Removed #{player.username} from #{@id}"
      ),1000*5
  setGM: (id, socket) ->
    @GM = {id: id, socket: socket}
  startBidding: () ->
    @bidding = true
    @emitToPlayers "startBidding"
  bid: (id, bid) ->
    if @bidding == false then return
    player = @findPlayer id
    player.makeBid bid
    @processBids()
  processBids: () ->
    #check to see if all the bids are in yet
    for player in @players
      if player.bid == null then return

    # HACK: MESSY CODE, PLEASE FIX ME!
    highest = @players[0]
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
    console.log highest
    highest.socket.emit "willpower", {willpower: highest.willpower}
    @updateGM()
    @emitToAll "stopBidding", {winner: highest.username}

  emitToPlayers: (name, data) ->
    @eachPlayer (player) ->
      player.socket.emit name, data
  emitToGM: (name, data) ->
    console.log "LOG: #{name} | #{data.length}"
    if @GM? then @GM.socket.emit name, data
  emitToAll: (name, data) ->
    @emitToPlayers name, data
    @emitToGM name, data
  updateGM: () ->
    players = []
    for player in @players
      {username, willpower, id} = player
      players.push {
        id
        username
        willpower
      }
    @emitToGM "players.update", players
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
  constructor: (@socket, @id, @username, @room) ->
    @bid = null
    @willpower = 10
    @left = false
  makeBid: (bid) ->
    if !@bid?
      @bid = bid
  spend: (value) ->
    if value > @willpower then return
    @willpower -= value
    @room.updateGM()
  changeUsername: (username) ->
    @username = username
  reset: () ->
    @bid = null

###
SOCKET CONNECTION
###
io.on "connection", (socket) ->
  room = null
  userId = null
  player = null

  socket.on "join", (data) ->
    {roomId, type, username} = data
    userId = data.userId
    room = findRoom roomId

    if !room?
      room = Room.create roomId
      rooms.push room

    socket.join roomId

    typeName = "PC"
    if type == PC
      console.log "LOG: Tried to join as a PC"
      player = room.findPlayer userId
      if !player?
        console.log "LOG: Did not find existing player"
        player = new Player socket, userId, username, room
        room.addPlayer player
      else
        #update the player's socket
        player.socket = socket
        player.left = false
      player.socket.emit "willpower",
        willpower: player.willpower
      if room.bidding == true
        player.socket.emit "startBidding"
    else if type == GM
      room.setGM userId, socket
      typeName = "GM"

    #update GM on recent player changes
    room.updateGM()



    if player?
      console.log "#{player.username}(#{userId}) joined #{room.id}"
    else
      console.log "GM(#{userId}) joined #{room.id}"

  socket.on "bid", (data) ->
    if !player? then return
    bid = data.bid
    room.bid userId, bid
    console.log "#{player.username} bid #{data.bid}"

  socket.on "startBidding", (data) ->
    if player? then return
    room.startBidding()

  socket.on "changeUsername", (data) ->
    if !player? then return
    data.username.replace(/[^a-zA-Z0-9\s[.]/g, "")
    player.changeUsername data.username
    console.log "#{player.username} changed their name to '#{data.username}'"

  socket.on "spend", (data) ->
    if !player? then return
    player.spend data.amount
    console.log "#{player.username} spent #{data.amount}"

  socket.on "disconnect", () ->
    if !room? then return
    room.removeUser userId

    if player?
      console.log "#{player.username}(#{userId}) left #{room.id}"
    else
      console.log "GM(#{userId}) left #{room.id}"

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
