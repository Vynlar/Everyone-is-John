class Component extends React.Component {
  _bind(...methods) {
    methods.forEach((method) => this[method] = this[method].bind(this));
  }
}

class PlayerLink extends Component {

  constructor() {
    super();
    this.state = {
      link: "http://" + window.location.host + "/game/" + window.roomId
    }
  }
  
  componentDidMount() {
    new QRCode(document.getElementById("playerQRCode"), this.state.link);
  }
  
  render() {
    return (
      <div>
        <br />
        <h3><a target="_blank" href={this.state.link}>{this.state.link}</a></h3>
      </div>
    );
  }
  
}

ReactDOM.render(<PlayerLink />, document.getElementById("playerLink"));