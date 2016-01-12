import React from "react";

class WillpowerRow extends React.Component{
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
      <tr onMouseEnter={this.onEnter} onMouseLeave={this.onLeave}>
        <td>
            <a href="#" onClick={this.bid}><img className="arrow" src="/images/arrow.png" /></a>
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

class WillpowerSlider extends React.Component {
  onEnter(index) {
    this.setState({hovered: index})
  }

  onLeave() {
    this.setState({hovered: -1})
  }

  getInitialState() {
    return {
      willpower: 7,
      hovered: -1
    };
  }

  componentDidMount() {
    var slider = this;
    socket.on("willpower", function(data) {
      console.log(data);
      slider.setState({willpower: data.willpower});
    });
  }
  render() {
    var rows = []
    for(var i = this.state.willpower; i >= 0; i--) {
        rows.push(<WillpowerRow key={i} index={i} willpower={this.state.willpower} hovered={this.state.hovered} onEnter={this.onEnter} onLeave={this.onLeave} />);
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
