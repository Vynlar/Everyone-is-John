class Component extends React.Component {
  _bind(...methods) {
    methods.forEach((method) => this[method] = this[method].bind(this));
  }
}

class Settings extends Component {
  constructor() {
    super();
    var sound = Cookies.get("sound"), vibration = Cookies.get("vibration");
    if(sound == null) {
      Cookies.set("sound", true);
    }
    if(vibration == null) {
      Cookies.set("vibration", true);
    }
    this.state = {
      sound: Cookies.get("sound") == "true",
      vibration: Cookies.get("vibration") == "true"
    }
    this._bind("toggleSound", "toggleVibrate");

  }
  
  toggleSound() {
    this.setState({"sound": !this.state.sound, "vibration": this.state.vibration}, () => {
      Cookies.set("sound", this.state.sound);
    });
    
  }
  
  toggleVibrate() {
    this.setState({"sound": this.state.sound, "vibration": !this.state.vibration}, () => {
      Cookies.set("vibration", this.state.vibration);
    });
  }
  
  render() {
    return (
      <header id="header">
        <h1><a href="/">EVERYONE IS JOHN</a></h1>
        <a href="javascript:{}" onClick={this.toggleSound.bind(this)}><i className={"right fa " + (this.state.sound ? "fa-volume-up" : "fa-volume-off")}></i></a>
        <a href="javascript:{}" onClick={this.toggleVibrate.bind(this)} className="hide-larger-than-small"><i className={"right fa " + (this.state.vibration ? "fa-bell" : "fa-bell-slash")}></i></a>
      </header>
    );
  }
}

ReactDOM.render(<Settings />, document.getElementById("headerContainer"));