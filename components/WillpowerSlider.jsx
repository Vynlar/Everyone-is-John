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
      highlight();
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
        <h3>{window.username}</h3>
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
        <div id="winner">
          <h3>{this.state.winner}</h3>
        </div>
      </div>
    );
  }
}

ReactDOM.render(<WillpowerSlider length={10} />, document.getElementById("slider"));
