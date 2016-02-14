class Component extends React.Component {
  _bind(...methods) {
    methods.forEach((method) => this[method] = this[method].bind(this));
  }
}

class Chat extends Component {

  constructor() {
    super();
    this.state = {
      visible: true,
      messages: {
        "GM": []
      }
    };
    
    this._bind("toggleVisibility", "onMessage", "messageRecieved");
    socket.on("message", this.messageRecieved);
  }
  
  messageRecieved(data) {
    let temp_messages = this.state.messages;
    let yourId = Cookies.get("userId");
    data.map(function(message) {
      let messageId = message.senderId == yourId ? message.recipientId : message.senderId;
      if (message.senderType == "GM") messageId = "GM";
      console.log(yourId);
      temp_messages[messageId].push(message);
    });
    console.log(temp_messages);
    this.setState({"messages": temp_messages});
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
      
      temp_messages[uid].push(messageObject);
      this.setState({"messages": temp_messages});
      
      socket.emit("sendMessage", { message: message, senderId: Cookies.get("userId") });
    }
  }
  
  toggleVisibility() {
    this.setState({"visible": !this.state.visible});
  }
  
  render() {
    Object.keys(this.state.messages).map((key, id) => {
      return (
        <div className="window" data-user-id={"x"}>
          <div className="topBar" onClick={this.toggleVisibility}>
            <h1><i className="fa fa-comments"></i>&nbsp;Game Master</h1>
          </div>
          <div className={"chatarea " + (this.state.visible ? "" : "hidden")}>
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
    }, this);
  }
}

ReactDOM.render(<Chat />, document.getElementById("chat"));