url = window.location.href
url = url.split "/"
url = url[url.length - 1]
url = url.split("#")[0]
window.roomId = url

guid = () ->
  s4 = () ->
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();

window.userId = Cookies.get("userId")
if !userId?
  window.userId = guid()

console.log userId

Cookies.set "userId", window.userId,
  expires: 2592000
