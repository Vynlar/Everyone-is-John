class Component extends React.Component {
  _bind(...methods) {
    methods.forEach((method) => this[method] = this[method].bind(this));
  }
}
class WillpowerRow extends Component{
  constructor() {
    super();
    this._bind("setState", "bid", "spend", "color", "onLeave", "onEnter", "click");
  }

  bid() {
    socket.emit("bid", {bid: this.props.index});
    this.props.lock(this.props.index);
  }

  spend() {
    socket.emit("spend", {amount: this.props.index});
  }

  click() {
    if(this.props.bidding) {
      this.bid();
    } else {
      this.spend();
    }
  }

  color() {
    var background = "";
    var percent = ((this.props.index + 1)/this.props.willpower);
    var hue = Math.round(100 * percent);

    var highlight = () => background = "hsl("+hue+", 100%, 35%)";
    if(this.props.locked >= 0 && this.props.index <= this.props.locked) {
      highlight();
    } else if(this.props.hovered >= 0 && this.props.index <= this.props.hovered) {
      if(this.props.hovered == 0) {
        highlight();
      } else if(this.props.index == 0 && this.props.hovered != 0) {
        //do nothing
        background = "hsl("+hue+", 40%, 30%)";
      } else {
        highlight();
      }
    } else {
      background = "hsl("+hue+", 40%, 30%)";
    }

    var result = {
      background: background,
      height: Math.floor(65/this.props.willpower) + "vh",
    };

    result.height = "1.4em";

    if(this.props.index == this.props.willpower) {
      result.borderRadius = "10px 10px 0 0";
    }
    if(this.props.index == 0) {
      result.borderRadius = "0 0 10px 10px";
    }
    return result;
  }

  onEnter() {
    this.props.setHover(this.props.index);
  }

  onLeave() {
    this.props.setHover(false);
  }

  render() {
    return (
      <tr onMouseEnter={this.onEnter} onMouseLeave={this.onLeave}>
        <td className="sliderTile" style={this.color()} onClick={this.click}>
          <p>{this.props.index}</p>
        </td>
      </tr>
    );
  }
}

class WillpowerSlider extends Component {
  constructor() {
    super();
    this.state = {
      willpower: 0,
      hovered: -1,
      bidding: false,
      locked: -1,
      winner: "Nothing"
    }
    this._bind("lock", "setHover");
  }

  setHover(index) {
    if(index === false) {
      this.setState({hovered: -1});
    } else {
      this.setState({hovered: index});
    }
  }

  lock(index) {
    this.setState({locked: index});
  }

  componentDidMount() {
    var slider = this;
    socket.on("willpower", function(data) {
      slider.setState({willpower: data.willpower});
    });
    socket.on("startBidding", () => {
      slider.setState({"bidding": true});
    });
    socket.on("stopBidding", (data) => {
      slider.setState({"bidding": false,
                       "winner": data.winner});
      slider.lock(-1)
    });
    socket.on("winner", (data) => {
      slider.setState({"winner": data});
    });
  }

  render() {
    var rows = []
    for(var i = this.state.willpower; i >= 0; i--) {
        rows.push(<WillpowerRow
          key={i}
          index={i}
          bidding={this.state.bidding}
          willpower={this.state.willpower}
          hovered={this.state.hovered}
          setHover={this.setHover}
          lock={this.lock}
          locked={this.state.locked}
        />);
    }
    return (
      <div className="relative">
        <table>
          <tbody>
            {rows}
          </tbody>
        </table>
        <div id="biddingIndicator">
          <div className={this.state.bidding ? "highlighted" : null}>
            <h1>Bid</h1>
          </div>
          <div className={this.state.bidding ? null : "highlighted"}>
            <h1>Spend</h1>
          </div>
        </div>
        <div style={this.state.winner === "" ? {display: "none"} : null} id="winner">
          <h3>{this.state.winner}</h3>
        </div>
      </div>
    );
  }
}

class Username extends Component {
  constructor() {
    super();
    this.state = {
        username: Cookies.get("username")
    }
    this._bind("changeUsername");
  }

  componentDidMount() {
    /*j
    var url = window.location.href;
    url = url.split("/");
    url = url[url.length - 1];
    url = url.split("#")[0];
    var roomId = url;

    guid = () => {
      s4 = () => {
        return Math.floor((1 + Math.random()) * 0x10000)
          .toString(16)
          .substring(1);
      return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
      }
    }

    var userId = Cookies.get("userId");
    if(userId === undefined || userId === null) {
      userId = guid();
    }

    Cookies.set("userId", window.userId, {expires: 2592000});

    var component = this;
    socket.on("connect", () => {
      var username = Cookies.get("username");
      if(username === undefined || username === null) {
        username = chance.name({middle: true, prefix: true});
        Cookies.set("username", username);
      }
      component.setState({"username": username});

      socket.emit("join", {
        roomId: roomId,
        type: 1,
        userId: Cookies.get("userId"),
        username: Cookies.get("username")
      });
    }
    */
  }

  changeUsername() {
    var newUsername = this.refs.username.value;
    if(newUsername === this.state.username) return;
    this.setState({"username": newUsername});
    Cookies.set("username", newUsername);
    socket.emit("changeUsername", {username: newUsername});
  }

  render() {
    return (
        <div>
          <input id="usernameInput" onBlur={this.changeUsername} ref="username" defaultValue={this.state.username} />
        </div>
    );
  }
}

ReactDOM.render(<WillpowerSlider length={10} />, document.getElementById("slider"));
ReactDOM.render(<Username />, document.getElementById("username"));
