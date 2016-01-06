#Socket.io Server API

##join
Must be called before anything else.

Required Arguments:
* roomId
  * Located in the page URL
* type
  * 0 for GM
  * 1 for PLAYER
* id
  * User's id (generate if necessary)
* username
  * User's display name (Generate if necessary)

##bid
Required Arguments:
* bid
  * Integer value of the bid

##startBidding
Must be called by a GM socket. Will do nothing if called by a player.

Required Arguments:
  * None

##changeUsername
Can only be called by a player.

Required Arguments:
    * username

---

#Socket.io Server Responses

##startBidding
Sent when the client should display the bidding controls. Bidding has commenced.

Data:
* None

##stopBidding
Called when the bidding is over.

Data:
* winner
  * the username of the winning bidder
