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

sanitizeString = (str) ->
  str.replace(/[^a-zA-Z0-9\s[.]/g, "")

class Room
  constructor: (roomId) ->
    @players = []
    @id = roomId
    @GM = null
    @bidding = true
    @winner = ""
    @messageIndex = 0
    @messages = []
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
          console.log "LOG: #{player.username} is inactive. Removed them from #{@id}"
      ),1000*60
  sendMessage: (data) ->
    {message, senderId, recipientId} = data
    senderType = "GM"
    recipientType = "GM"
    senderUsername = "GM"
    @players.forEach (player)=>
      if player.id == senderId
        senderUsername = player.username
        senderType = "PC"
      if player.id == recipientId
        recipientType = "PC"

    console.log "#{senderType}(#{senderId}) sent message '#{message}' to #{recipientType}(#{recipientId})"
    messageObject =
      sender: senderUsername
      message: message
      senderId: senderId
      senderType: senderType
      recipientId: recipientId || "GM"
      sent: new Date().toISOString()
      id: @messageIndex
    @messageIndex++
    @messages.push messageObject
    sendToPlayer = ()=>
    if senderType == "GM"
      @players.some (player) =>
        player.socket.emit "message", [messageObject]
    if senderType == "GM"
      sendToPlayer()
    else
      if recipientType == "PC"
        sendToPlayer()
      else
        @GM.socket.emit "message", [messageObject]
  syncGMMessages: () =>
    if(@GM?)
      @GM.socket.emit "message", @messages
  setGM: (id, socket) ->
    @GM = {id: id, socket: socket}
  isGM: (userID) ->
    if !@GM? then return true
    @GM.id == userID
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
      {username, willpower, id, obsession, obsessionApproved, obsessionWorth, skills, lockedSkills, totalScore} = player
      players.push {
        id
        username
        willpower,
        obsession,
        obsessionApproved,
        obsessionWorth,
        skills,
        lockedSkills,
        totalScore
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
    @obsession = ""
    @obsessionApproved = false
    @obsessionWorth = 0
    @skills = new Array 3
    @lockedSkills = [!1,!1,!1]
    @totalScore = 0
  update: () ->
    @socket.emit "yourPlayer.update", @getInformation()
  makeBid: (bid) ->
    @bid = bid
  spend: (value) ->
    if value > @willpower then return
    @willpower -= value
    @socket.emit "willpower", {willpower: @willpower}
    @room.updateGM()
  syncMessages: () =>
    messages = @room.messages.filter (message)=>
      if message.senderId == @id || message.recipientId == @id
        return true
      return false
    @socket.emit "message", messages
  changeUsername: (username) ->
    if username == @username then return false
    @username = username
  setObsession: (obsession) ->
    if obsession == @obsession then return false
    @obsession = obsession
    @room.updateGM()
  setSkill: (skill, id) ->
    if @skills[id] == skill or id > 2 then return false
    @skills[id] = skill
    @room.updateGM()
  setObsessionApproved: (state) ->
    if !state
      @obsession = ""
    @obsessionApproved = state
    @update()
    @room.updateGM()
  setSkillState: (state, id) ->
    if !state
      @skills[id] = ""
      @lockedSkills[id] = false
    else
      @lockedSkills[id] = true
    i = 0
    for locked in @lockedSkills
      if locked then i++
    if i == 3 then @spend(3)
    @update()
    @room.updateGM()
  setObsessionWorth: (worth) ->
    @obsessionWorth = worth
    @update()
  completeObsession: () ->
    @totalScore += Number @obsessionWorth
    @room.updateGM()
    @update()
  givePoint: (amount) ->
    if (@totalScore + amount) < 0 then return
    @totalScore += amount
    @room.updateGM()
    @update()
  getInformation: () ->
    {
      @willpower
      @obsession
      @obsessionApproved
      @obsessionWorth
      @skills
      @lockedSkills
      @totalScore
    }
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
      socket.on "setObsession", (data) ->
        player.setObsession data
      player.socket.emit "winner", room.winner
      player.socket.emit "yourPlayer.update", player.getInformation()
      player.syncMessages()
    else if type == GM
      if !room.isGM userId
        socket.emit "invalidGM"
        return
      room.setGM userId, socket
      typeName = "GM"
      socket.emit "stopBidding", {winner: room.winner}
      room.syncGMMessages()

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
    room.winner = ""
    room.startBidding()

  socket.on "changeUsername", (data) ->
    if !player? then return
    oldUsername = player.username
    data.username = sanitizeString data.username
    if player.changeUsername data.username
      console.log "LOG: #{oldUsername} changed their name to '#{data.username}'"
    else
      console.log "ERROR: #{player.username} was already named that!"
    room.updateGM()

  socket.on "sendMessage", (data) ->
    room.sendMessage data

  socket.on "sleep", (data) ->
    room.sleep()

  socket.on "spend", (data) ->
    if !player? then return
    player.spend data.amount
    console.log "LOG: #{player.username} spent #{data.amount} willpower"

  socket.on "setObsession", (data) ->
    if !player? then return
    data = sanitizeString data
    player.setObsession data
    console.log "LOG: #{player.username} set obsession to #{data}"

  socket.on "setSkill", (data) ->
    if !player? then return
    data.skill = sanitizeString(data.skill)
    player.setSkill data.skill, data.id
    console.log "LOG: #{player.username} set skill #{data.id} to #{data.skill}"

  socket.on "willpowerOverride", (data) ->
    if player? then return
    selectedPlayer = room.findPlayer data.id
    if !selectedPlayer? then return
    selectedPlayer.spend -data.amount
    console.log "LOG: #{selectedPlayer.username} willpower #{data.amount}"

  socket.on "setObsessionState", (data) ->
    if player? then return
    selectedPlayer = room.findPlayer data.id
    selectedPlayer.setObsessionApproved data.state
    approved = if data.state then "" else "not"
    console.log "LOG: Obsession for #{selectedPlayer.username} #{approved} approved"

  socket.on "setSkillState", (data) ->
    if player? then return
    selectedPlayer = room.findPlayer data.id
    selectedPlayer.setSkillState data.state, data.skillId
    approved = if data.state then "" else "not"
    console.log "LOG: Skill #{data.skillId} for #{selectedPlayer.username} #{approved} approved"

  socket.on "setObsessionWorth", (data) ->
    if player? then return
    if data.amount < 0 or data.amount > 3 then return
    selectedPlayer = room.findPlayer data.id
    selectedPlayer.setObsessionWorth data.amount
    console.log "LOG: Obsession for #{selectedPlayer.username} now worth #{data.amount} points"

  socket.on "obsessionCompletion", (data) ->
    if player? then return
    selectedPlayer = room.findPlayer data.id
    selectedPlayer.completeObsession()
    console.log "LOG: Obsession for #{selectedPlayer.username} completed"

  socket.on "addPoint", (data) ->
    if player? then return
    selectedPlayer = room.findPlayer data.id
    selectedPlayer.givePoint data.amount
    console.log "LOG: Added #{data.amount} points to #{selectedPlayer.username}"

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
