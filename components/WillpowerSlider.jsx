class Component extends React.Component {
  bind(...methods) {
    methods.forEach((method) => this[method] = this[method].bind(this));
  }
}
class WillpowerRow extends Component{
  constructor() {
    super();
    this.setState = this.setState.bind(this);
    this.bid = this.bid.bind(this);
    this.spend = this.spend.bind(this);
    this.color = this.color.bind(this);
    this.onLeave = this.onLeave.bind(this);
    this.onEnter = this.onEnter.bind(this);
  }

  bid() {
    socket.emit("bid", {bid: this.props.index});
  }

  spend() {
    socket.emit("spend", {amount: this.props.index});
  }

  color() {
    var background = "";
    var percent = ((this.props.index + 1)/this.props.willpower);
    var hue = Math.floor(100 * percent);
    if(this.props.hovered >= 0 && this.props.index <= this.props.hovered) {
      background = "hsl("+hue+", 100%, 35%)";
    } else {
      background = "hsl("+hue+", 40%, 30%)";
    }
    return {
      background: background,
      width: "150px",
      textAlign: "center",
      color: "white",
      transition: "background .5s"
    };
  }

  onEnter() {
    this.props.onEnter(this.props.index);
  }

  onLeave() {
    this.props.onLeave();
  }

  render() {
    return (
      <tr onMouseEnter={this.onEnter.bind(this)} onMouseLeave={this.onLeave.bind(this)}>
        <td>
            {this.props.bidding ? <a href="#" onClick={this.bid.bind(this)}><img className="arrow" src="/images/arrow.png" /></a> : null}
        </td>
        <td style={this.color()}>
          {this.props.index}
        </td>
        <td>
          <a href="#" onClick={this.spend}><img className="arrow flip" src="/images/arrow.png" /></a>
        </td>
      </tr>
    );
  }
}

class WillpowerSlider extends Component {

  constructor() {
    super();
    this.state = {
      willpower: 7,
      hovered: -1,
      bidding: false
    }
    this.onEnter = this.onEnter.bind(this);
    this.onLeave = this.onLeave.bind(this);
  }

  onEnter(index) {
    this.setState({hovered: index})
  }

  onLeave() {
    this.setState({hovered: -1})
  }

  componentDidMount() {
    var slider = this;
    socket.on("willpower", function(data) {
      console.log(data);
      //slider.state.willpower = data.willpower;
      slider.setState({willpower: data.willpower});
    });
    socket.on("startBidding", () => {
        slider.setState({"bidding": true});
    });
    socket.on("stopBidding", () => {
        slider.setState({"bidding": false});
    });
  }

  render() {
    var rows = []
    for(var i = this.state.willpower; i >= 0; i--) {
        rows.push(<WillpowerRow key={i} index={i} bidding={this.state.bidding} willpower={this.state.willpower} hovered={this.state.hovered} onEnter={this.onEnter} onLeave={this.onLeave} />);
    }
    return (
      <table>
        <tbody>
          <tr>
            <td>
              Bid
            </td>
            <td></td>
            <td>
              Spend
            </td>
          </tr>
          {rows}
        </tbody>
      </table>
    );
  }
}

ReactDOM.render(<WillpowerSlider length={10} />, document.getElementById("content"));
