class Component extends React.Component {
  _bind(...methods) {
    methods.forEach((method) => this[method] = this[method].bind(this));
  }
}

class Chat extends Component {

  constructor() {
    super();
    this.state = {
      visible: { GM: true },
      closed: { GM: false },
      messages: { GM: [] }
    };
    
    this._bind("toggleVisibility", "onMessage", "messageRecieved");
    socket.on("message", this.messageRecieved);
  }
  
  messageRecieved(data) {
    console.log(data);
    let temp_messages = this.state.messages;
    let visibility = this.state.visible;
    let closed = this.state.closed;
    let yourId = Cookies.get("userId");
    data.map(function(message) {
      let messageId = message.senderId == yourId ? (message.recipientId == null ?  "GM" : message.recipientId) : message.senderId;
      if (message.senderType == "GM" && (typeof isGM === 'undefined')) messageId = "GM";
      console.log(yourId, messageId, message.senderId);
      if(temp_messages[messageId] == null) {
        temp_messages[messageId] = [];
        visibility[messageId] = true;
        closed[messageId] = false;
      }
      temp_messages[messageId].push(message);
    });
    console.log(temp_messages);
    this.setState({"messages": temp_messages, "visible": visibility, "closed": closed});
  }
  
  onMessage(event) {
    if(event.charCode === 13) {
      if(event.target.value == "") return;
      var UID = event.target.parentNode.parentNode.parentNode.getAttribute("data-user-id");
      
      let temp_messages = this.state.messages;
      let message = event.target.value;
      event.target.value = "";
      let messageObject = {
        sender: Cookies.get("username"),
        message: message,
        senderId: Cookies.get("userId"),
        sent: new Date().toISOString(),
        id: this.state.messages.length
      };
      
      temp_messages[UID].push(messageObject);
      this.setState({"messages": temp_messages});
      console.log(temp_messages);
      socket.emit("sendMessage", { message: message, senderId: Cookies.get("userId"), recipientId: UID != "GM" ? UID : null});
    }
  }
  
  toggleVisibility(event) {
    let UID = event.currentTarget.parentNode.getAttribute("data-user-id");
    let visibility = this.state.visible;
    visibility[UID] = !visibility[UID];
    this.setState({"visible": visibility});
  }
  
  toggleClosed(event) {
    let UID = event.currentTarget.parentNode.parentNode.getAttribute("data-user-id");
    let closed = this.state.closed;
    closed[UID] = !closed[UID];
    this.setState({"closed": closed});
  }
  
  render() {
    return(
      <div>
      {
        Object.keys(this.state.messages).map((key, id) => {
          var GM = typeof isGM !== "undefined";
          if(GM && key == "GM") return false;
          return (
            <div className={this.state.closed[key] ? "window hidden" : "window"} data-user-id={key} >
              <div className="topBar" onClick={this.toggleVisibility}>
                <h1><i className="fa fa-comments"></i>&nbsp;{this.state.messages[key] != null && key != "GM" ? this.state.messages[key][0].sender : "Game Master"}</h1>
              </div>
              <div className={"chatarea " + (this.state.visible[key] ? "" : "hidden")}>
                <div className="messages">
                  <ul>
                  {
                    this.state.messages[key].map((msg, i) => {
                      return (
                        <li data-message-id={msg.id} data-ts={msg.sent} data-isuser={msg.senderId == Cookies.get('userId') ? "true" : ""}>{msg.message}</li>
                      );
                    })
                  }
                  </ul>
                </div>
                <div className="textArea">
                  <input type="text" placeholder="Type a message..." onKeyPress={this.onMessage} />
                </div>
              </div>
            </div>
          )
        }, this)
      }
      </div>
    )
  }
}