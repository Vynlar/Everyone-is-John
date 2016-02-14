class Component extends React.Component {
  _bind(...methods) {
    methods.forEach((method) => this[method] = this[method].bind(this));
  }
}

class Chat extends Component {

  constructor() {
    super();
    this.state = {
      visible: true
    };
    this._bind("toggleVisibility", "onMessage");
  }
  
  onMessage(event) {
    console.log(event.charCode);
  }
  
  toggleVisibility() {
    this.setState({"visible": !this.state.visible});
  }
  
  render() {
    return (
      <div className="window">
        <div className="topBar" onClick={this.toggleVisibility}>
          <h1><i className="fa fa-comments"></i>&nbsp;Game Master</h1>
        </div>
        <div className={"chatarea " + (this.state.visible ? "" : "hidden")}>
          <div className="textArea">
            <input type="text" placeholder="Type a message..." onKeyPress={this.onMessage} />
          </div>
        </div>
      </div>
    );
  }
}

ReactDOM.render(<Chat />, document.getElementById("chat"));