(function() {
  var GM, PC, Player, Room, app, express, findRoom, http, io, port, rooms;

  express = require("express");

  app = express();

  http = require("http").Server(app);

  io = require("socket.io")(http);


  /*
  ROOMS
   */

  rooms = [];

  Room = (function() {
    function Room(roomId) {
      this.players = [];
      this.id = roomId;
      this.GM = null;
      this.bidding = true;
    }

    Room.prototype.addPlayer = function(player) {
      return this.players.push(player);
    };

    Room.prototype.removeUser = function(id) {
      var i, index, j, len, player, ref;
      if ((this.GM != null) && this.GM.id === id) {
        console.log("LOG: Found the GM to remove");
        this.GM = null;
        return;
      }
      index = -1;
      ref = this.players;
      for (i = j = 0, len = ref.length; j < len; i = ++j) {
        player = ref[i];
        if (player.id === id) {
          index = i;
        }
      }
      if (index !== -1) {
        return this.players.splice(index, 1);
      }
    };

    Room.prototype.setGM = function(id, socket) {
      return this.GM = {
        id: id,
        socket: socket
      };
    };

    Room.prototype.startBidding = function() {
      this.bidding = true;
      return this.emitToPlayers("startBidding");
    };

    Room.prototype.bid = function(id, bid) {
      var player;
      if (this.bidding === false) {
        return;
      }
      player = this.findPlayer(id);
      player.makeBid(bid);
      return this.checkBids();
    };

    Room.prototype.checkBids = function() {
      var j, len, player, ref;
      ref = this.players;
      for (j = 0, len = ref.length; j < len; j++) {
        player = ref[j];
        if (player.bid === null) {
          return;
        }
      }
      return this.processBids();
    };

    Room.prototype.processBids = function() {
      var highest, i, j, len, player, ref, ties;
      highest = {
        bid: 0
      };
      ties = [];
      ref = this.players;
      for (j = 0, len = ref.length; j < len; j++) {
        player = ref[j];
        if (player.bid > highest.bid) {
          highest = player;
          ties = [];
        }
        if (player.bid === highest.bid) {
          ties.push(player);
        }
      }
      if (ties.length > 0) {
        ties.push(highest);
        i = Math.floor(Math.random() * ties.length);
        highest = ties[i];
      }
      highest.spend(highest.bid);
      this.bidding = false;
      this.resetPlayers();
      highest.socket.emit("willpower", {
        willpower: highest.willpower
      });
      return this.emitToAll("stopBidding", {
        winner: highest.username
      });
    };

    Room.prototype.emitToPlayers = function(name, data) {
      return this.eachPlayer(function(player) {
        return player.socket.emit(name, data);
      });
    };

    Room.prototype.emitToGM = function(name, data) {
      if (this.GM == null) {
        return;
      }
      return this.GM.socket.emit(name, data);
    };

    Room.prototype.emitToAll = function(name, data) {
      this.emitToPlayers(name, data);
      return this.emitToGM(name, data);
    };

    Room.prototype.resetPlayers = function() {
      return this.eachPlayer(function(player) {
        return player.reset();
      });
    };

    Room.prototype.findPlayer = function(id) {
      var j, len, player, ref;
      ref = this.players;
      for (j = 0, len = ref.length; j < len; j++) {
        player = ref[j];
        if (player.id === id) {
          return player;
        }
      }
      return null;
    };

    Room.prototype.eachPlayer = function(op) {
      var i, j, len, player, ref, results;
      ref = this.players;
      results = [];
      for (i = j = 0, len = ref.length; j < len; i = ++j) {
        player = ref[i];
        results.push(op(player, i));
      }
      return results;
    };

    Room.create = function(roomId) {
      return new Room(roomId);
    };

    return Room;

  })();

  findRoom = function(roomId) {
    var j, len, room;
    for (j = 0, len = rooms.length; j < len; j++) {
      room = rooms[j];
      if (room.id === roomId) {
        return room;
      }
    }
    return null;
  };


  /*
  PLAYER
   */

  GM = 0;

  PC = 1;

  Player = (function() {
    function Player(socket1, id1, username1) {
      this.socket = socket1;
      this.id = id1;
      this.username = username1;
      this.bid = null;
      this.willpower = 10;
    }

    Player.prototype.makeBid = function(bid) {
      if (this.bid == null) {
        return this.bid = bid;
      }
    };

    Player.prototype.spend = function(value) {
      return this.willpower -= value;
    };

    Player.prototype.setUsername = function(username) {
      return this.username = username;
    };

    Player.prototype.reset = function() {
      return this.bid = null;
    };

    return Player;

  })();


  /*
  SOCKET CONNECTION
   */

  io.on("connection", function(socket) {
    var id, roomId;
    roomId = "";
    id = "";
    socket.on("join", function(data) {
      var player, room, type, username;
      roomId = data.roomId;
      room = findRoom(roomId);
      type = data.type;
      id = data.userId;
      username = data.username;
      socket.join(roomId);
      if (room == null) {
        room = Room.create(roomId);
        rooms.push(room);
      }
      if (type === PC) {
        player = new Player(socket, id, username);
        room.addPlayer(player);
        player.socket.emit("willpower", {
          willpower: player.willpower
        });
      } else {
        room.setGM(id, socket);
      }
      if (type === GM) {
        type = "GM";
      } else {
        type = "PLAYER";
      }
      return console.log("LOG: " + id + " joined " + roomId + " as " + type);
    });
    socket.on("bid", function(data) {
      var bid, room;
      bid = data.bid;
      room = findRoom(roomId);
      return room.bid(id, bid);
    });
    socket.on("startBidding", function(data) {
      var room;
      room = findRoom(roomId);
      if (room.GM.socket === socket) {
        return room.startBidding();
      }
    });
    socket.on("changeUsername", function(data) {
      var player, room;
      room = findRoom(roomId);
      player = room.findPlayer(id);
      if (player == null) {
        return;
      }
      return player.changeUsername(data.username);
    });
    socket.on("spend", function(data) {
      var value;
      return value = data.amount;
    });
    return socket.on("disconnect", function() {
      var room;
      room = findRoom(roomId);
      if (room == null) {
        return;
      }
      room.removeUser(id);
      return console.log("LOG: " + id + " left " + roomId);
    });
  });


  /*
  MIDDLEWARE
   */

  app.use(express["static"](__dirname + "/public"));


  /*
  ROUTES
   */

  app.get("/:roomId", function(req, res) {
    return res.sendFile(__dirname + "/views/player.html");
  });

  app.get("/gm/:roomId", function(req, res) {
    return res.sendFile(__dirname + "/views/gm.html");
  });


  /*
  START SERVER
   */

  port = 3000;

  http.listen(port, function() {
    return console.log("Server started on " + port);
  });

}).call(this);

