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
    var darken = () => background = "hsl("+hue+", 40%, 30%)";
    if(this.props.hovered >= 0 && this.props.index <= this.props.hovered) {
      if(this.props.hovered == 0) {
        highlight();
      } else if(this.props.index == 0 && this.props.hovered != 0) {
        darken();
      } else {
        highlight();
      }
    } else if(this.props.locked >= 0 && this.props.index <= this.props.locked) {
      if(this.props.index != 0) {
        highlight();
      } else {
        darken();
      }
    } else {
      darken();
    }

    var style = {
      background: background,
      height: Math.floor(65/this.props.willpower) + "vh",
    };

    style.height = "1.4em";

    if(this.props.index == this.props.willpower) {
      style.borderRadius = "5px 5px 0 0";
    }
    if(this.props.index == 1) {
      style.borderRadius = "0 0 5px 5px";
    }
    if(this.props.index == 0) {
      style.borderRadius = "5px 5px 5px 5px";
      if(this.props.willpoer != 0) {
        style.marginTop = ".3em";
      }
    }
    if(this.props.willpower == 1 && this.props.index == 1) {
      style.borderRadius = "5px 5px 5px 5px";
    }

    return style;
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
        <td className="sliderTile" onClick={this.click}>
          <div style={this.color()}>
            <p>{this.props.index}</p>
          </div>
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
    this.alertTone = new AudioPlayer("/sfx/Alert");
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
    navigator.vibrate = navigator.vibrate || navigator.webkitVibrate || navigator.mozVibrate || navigator.msVibrate;
    
    socket.on("willpower", function(data) {
      slider.setState({willpower: data.willpower});
    });
    socket.on("startBidding", () => {
      if(Cookies.get("sound") == "true") {
        this.alertTone.play();
      }
      if(typeof navigator.vibrate === "function" && (Cookies.get("vibration") == "true")) {
        navigator.vibrate([200, 100, 200]);
      }
      slider.setState({"bidding": true, "winner": ""});
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
      <div className="row 100% uniform">
        <section className="4u 12u$(small)">
          <div id="biddingIndicator">
            <p className="boxTitle">Currently</p>
            <div className={this.state.bidding ? "highlighted" : null}>
              <h1>Bidding</h1>
            </div>
            <div className={this.state.bidding ? null : "highlighted"}>
              <h1>Spending</h1>
            </div>
          </div>
        </section>
        <section className="4u 12u$(small)">
          <p className="boxTitle">Willpower</p>
          <table>
            <tbody>
              {rows}
            </tbody>
          </table>
        </section>
        <section className="4u 12u$(small)">
          <div style={this.state.bidding === "" ? {visiblity: "hidden"} : null} id="winnerWrapper">
            <p className="boxTitle">In Control</p>
            <div  id="winner">
              <h3>{this.state.winner}</h3>
            </div>
          </div>
        </section>
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
