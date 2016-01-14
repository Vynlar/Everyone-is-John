class Component extends React.Component {
  _bind(...methods) {
    methods.forEach((method) => this[method] = this[method].bind(this));
  }
}

class Winner extends Component {

  constructor() {
    super();
    this.state = {
      winner: ""
    }
  }

  componentDidMount() {
    socket.on("stopBidding", (data) => {
      this.setState({winner: data.winner});
    });
  }

  render() {
    return (
      <p>{this.state.winner}</p>
    );
  }
}

ReactDOM.render(<Winner />, document.getElementById("winner"));
