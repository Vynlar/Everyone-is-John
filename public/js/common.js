(function() {
  var guid, url;

  url = window.location.href;

  url = url.split("/");

  window.roomId = url[url.length - 1];

  guid = function() {
    var s4;
    s4 = function() {
      return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    };
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
  };

  window.userId = Cookies.get("userId");

  if (typeof userId === "undefined" || userId === null) {
    window.userId = guid();
  }

  console.log(userId);

  Cookies.set("userId", window.userId, {
    expires: 2592000
  });

}).call(this);

