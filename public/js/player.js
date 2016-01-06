(function() {
  var GM, PC, roomId, socket;

  socket = io();

  roomId = "";

  GM = 0;

  PC = 1;

  socket.on("connect", function() {
    var username;
    console.log("LOG: connected to socket");
    username = Cookies.get("username");
    if (username == null) {
      username = chance.name({
        middle: true,
        prefix: true
      });
      Cookies.set("username", username);
    }
    document.getElementById("name").innerHTML = username;
    return socket.emit("join", {
      roomId: window.roomId,
      type: PC,
      userId: Cookies.get("userId"),
      username: Cookies.get("username")
    });
  });

  socket.on("startBidding", function(data) {
    console.log("LOG: Start Bidding");
    document.getElementById("bidding").style.display = "block";
    return document.getElementById("winner").innerHTML = "";
  });

  socket.on("stopBidding", function(data) {
    document.getElementById("winner").innerHTML = data.winner;
    return document.getElementById("bidding").style.display = "none";
  });


  /*
  Click Events
   */

  document.getElementById("bid").addEventListener("click", function(e) {
    var bid;
    bid = document.getElementById("bidField").value;
    document.getElementById("bidField").value = null;
    document.getElementById("bidding").style.display = "none";
    return socket.emit("bid", {
      bid: bid
    });
  });

}).call(this);

