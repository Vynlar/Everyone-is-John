class Component extends React.Component {
  _bind(...methods) {
    methods.forEach((method) => this[method] = this[method].bind(this));
  }
}


class PlayerList extends Component {
  constructor() {
    super();
    this.state = { 
      players: [] 
    }
  }
  
  componentDidMount() {
    var parent = this;
    socket.on("players.update", function(data) {
      console.log(data);
      parent.setState({players: data});
    });
  }
  
  render() {
    return (
      <div className="row players">
        {
          this.state.players.map(function(player) {
            return (
              <section className="3u 4u$(medium) 12u$(small)"  data-user-name={player.username}>
                <Player player={player}/>
              </section>
            );
          })
        }
     </div>
    );
  }
}

ReactDOM.render(<PlayerList />, document.getElementById("playerList"));