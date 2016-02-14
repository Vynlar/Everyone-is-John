class Component extends React.Component {
  _bind(...methods) {
    methods.forEach((method) => this[method] = this[method].bind(this));
  }
}

class Player extends Component {

  constructor() {
    super();
    this.state = {
      player: {
        skills: []
      }
    }
    this._bind("updateState", "updateSkill");
  }
  
  componentDidMount() {
    var parent = this;
    socket.on("yourPlayer.update", function(data) {
      console.log(data);
      parent.setState({player: data});
    });
  }
  
  updateState(data) {
    var temp = Object.assign({}, this.state.player);
    var keys = Object.keys(data);
    for(var i = 0; i < keys.length; i++) {
      temp[keys[i]] = data[keys[i]];
    }
    
    this.setState({player: temp});
  }
  
  updateSkill(id, skill) {
    var temp = Object.assign({}, this.state.player);
    temp.skills[id] = skill;
    this.setState({player: temp});
  }
  
  render() {
    return (
      <div className="userInfo">
        <UserData player={this.state.player} updateState={this.updateState} updateSkill={this.updateSkill} />
      </div>
    );
  }
  
}

ReactDOM.render(<Player />, document.getElementById("player"));
ReactDOM.render(<Chat />, document.getElementById("chat"));