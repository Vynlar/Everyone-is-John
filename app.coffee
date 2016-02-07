express = require "express"
app = express()
http = require("http").Server app
io = require("socket.io")(http)
_ = require "underscore"
args = require("yargs").argv

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
    @winner = ""
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
      @players[index].left = true

      setTimeout (=>
        if player.left == true
          @players.splice index, 1
          @updateGM()
          console.log "LOG: #{player.username} is inactive. Removed them from #{@roomId}"
      ),1000*10
  setGM: (id, socket) ->
    @GM = {id: id, socket: socket}
  startBidding: () ->
    @bidding = true
    @updateGM()
    @emitToPlayers "startBidding"
  bid: (id, bid) ->
    if @bidding == false then return
    player = @findPlayer id
    player.makeBid bid
    @processBids()
  sleep: () ->
    @eachPlayer (player) ->
      player.willpower++
      player.socket.emit "willpower", {willpower: player.willpower}
    @updateGM()
  processBids: () ->
    for player in @players
      if player.bid == null then return

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

    @winner = highest.username
    highest.spend highest.bid
    @bidding = false
    @resetPlayers()
    highest.socket.emit "willpower", {willpower: highest.willpower}
    @updateGM()
    @emitToAll "stopBidding", {winner: highest.username}
    console.log "LOG: #{highest.username} has won control of #{@id}!"

  emitToPlayers: (name, data) ->
    @eachPlayer (player) ->
      player.socket.emit name, data
  emitToGM: (name, data) ->
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
    console.log "LOG: Updated GM with #{players.length} players."
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
    @bid = bid
  spend: (value) ->
    if value > @willpower then return
    @willpower -= value
    @socket.emit "willpower", {willpower: @willpower}
    @room.updateGM()
  changeUsername: (username) ->
    if username == @username then return false
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
    console.log "tried to join"
    {roomId, type, username} = data
    userId = data.userId
    room = findRoom roomId

    if !room?
      room = Room.create roomId
      rooms.push room

    socket.join roomId

    typeName = "PC"
    if type == PC
      player = room.findPlayer userId
      if !player?
        console.log "LOG: Did not find existing player"
        if !userId? || !username?
          console.log "LOG: userId or username is undefined"
          return
        player = new Player socket, userId, username, room
        room.addPlayer player
      else
        console.log "LOG: Found existing player: #{player.username}"
        #update the player's socket
        player.socket = socket
        player.left = false
      player.socket.emit "willpower",
        willpower: player.willpower
      if room.bidding == true
        player.socket.emit "startBidding"
      player.socket.emit "winner", room.winner
    else if type == GM
      room.setGM userId, socket
      typeName = "GM"
      socket.emit "stopBidding", {winner: room.winner}

    #update GM on recent player changes
    room.updateGM()

    if player?
      console.log "LOG: #{player.username}(#{userId}) joined #{room.id}"
    else
      console.log "LOG: GM(#{userId}) joined #{room.id}"

  socket.on "bid", (data) ->
    if !player? then return
    bid = data.bid
    room.bid userId, bid
    console.log "LOG: #{player.username} bid #{data.bid} in #{room.id}"

  socket.on "startBidding", (data) ->
    if player? then return
    room.startBidding()

  socket.on "changeUsername", (data) ->
    if !player? then return
    oldUsername = player.username
    data.username.replace(/[^a-zA-Z0-9\s[.]/g, "")
    if player.changeUsername data.username
      console.log "LOG: #{oldUsername} changed their name to '#{data.username}'"
    else
      console.log "ERROR: #{player.username} was already named that!"
    room.updateGM()


  socket.on "sleep", (data) ->
    room.sleep()

  socket.on "spend", (data) ->
    if !player? then return
    player.spend data.amount
    console.log "LOG: #{player.username} spent #{data.amount} willpower"

  socket.on "willpowerOverride", (data) ->
    player = room.findPlayer data.id
    if !player? then return
    player.spend -data.amount
    console.log "LOG: #{player.username} willpower #{data.amount}"
  socket.on "disconnect", () ->
    if !room? then return
    room.removeUser userId

    room.updateGM()

    if player?
      console.log "LOG: #{player.username}(#{userId}) disconnected from #{room.id}"
    else
      console.log "LOG: GM(#{userId}) disconnected from #{room.id}"

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
if args.port then port = args.port else port = 3000
http.listen port, () ->
  console.log "Server started on " + port
