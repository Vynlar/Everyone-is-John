(function() {
  var GM, PC, socket;

  socket = io();

  GM = 0;

  PC = 1;

  socket.on("connect", function() {
    console.log("LOG: connected");
    return socket.emit("join", {
      roomId: window.roomId,
      type: GM,
      userId: Cookies.get("userId")
    });
  });

  document.getElementById("beginTest").addEventListener("click", function(e) {
    return socket.emit("startBidding");
  });

}).call(this);

