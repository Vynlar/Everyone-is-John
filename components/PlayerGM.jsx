class Component extends React.Component {
  _bind(...methods) {
    methods.forEach((method) => this[method] = this[method].bind(this));
  }
}

class Player extends Component {

  constructor() {
    super();
    this._bind("updateWillpower", "setObsessionState", "setSkillState", "setObsessionWorth", "completeObsession", "addPoint");
  }
  
  updateWillpower(direction) {
    socket.emit("willpowerOverride", {
      id: this.props.player.id,
      amount: direction
    });
  }
  
  setObsessionState(state) {
    if(this.props.player.obsession == "") return;
    socket.emit("setObsessionState", {
      id: this.props.player.id,
      state: state
    });
  }
  
  setSkillState(id, state) {
    socket.emit("setSkillState", {
      id: this.props.player.id,
      state: state,
      skillId: id
    });
  }

  setObsessionWorth() {
    var worth = document.getElementById("obsession-" + this.props.player.id).value;
    socket.emit("setObsessionWorth", {
      id: this.props.player.id,
      amount: Number(worth)
    });
  }
  
  completeObsession() {
    socket.emit("obsessionCompletion", {
      id: this.props.player.id
    });
  }
  
  addPoint(amount) {
    socket.emit("addPoint", {
      id: this.props.player.id,
      amount: amount
    });
  }
  
  render() {
    return (
      <div className="player unselectable" data-user-id={this.props.player.id}>
        <h1>{this.props.player.username}</h1>
        <h2>{this.props.player.willpower}</h2>
        <ul className="actions willpowerControls">
          <li><a href="javascript:{}" className="button willpowerControl" onClick={this.updateWillpower.bind(this, -1)}>-1</a></li>
          <li><a href="javascript:{}" className="button willpowerControl" onClick={this.updateWillpower.bind(this, +1)}>+1</a></li>
        </ul>
        <div className="row uniform">
          <div className="12u score">
            <h3>Points: <span>{this.props.player.totalScore}</span></h3>&ensp;
            <ul className="actions">
              <li className="add" onClick={this.addPoint.bind(this, +1)}><i className="fa fa-plus"></i></li>
              <li className="minus" onClick={this.addPoint.bind(this, -1)}><i className="fa fa-minus"></i></li>
            </ul>
          </div>
        </div>
        <div className="userInfo">
          <div className={"obsessionInfo " + (this.props.player.obsession == "" ? "hide" : "")}>
            <h4 className="obsession">Obsession: {this.props.player.obsession}&ensp;</h4>
            <div className="row unifrom obsessionOptions">
              <div className="4u">
                <i className={"fa fa-check approve " + (this.props.player.obsessionApproved ? "true" : "")} onClick={this.setObsessionState.bind(this, true)}></i>
              </div>
              <div className="4u">
                 <i className="fa fa-times deny" onClick={this.setObsessionState.bind(this, false)}></i>
              </div>
              <div className="4u">
                <select name="cat" id={"obsession-" + this.props.player.id} onChange={this.setObsessionWorth.bind(this)}>
                  <option value="0" selected={this.props.player.obsessionWorth == 0 ? "true" : ""}>--</option>
                  <option value="1" selected={this.props.player.obsessionWorth == 1 ? "true" : ""}>1</option>
                  <option value="2" selected={this.props.player.obsessionWorth == 2 ? "true" : ""}>2</option>
                  <option value="3" selected={this.props.player.obsessionWorth == 3 ? "true" : ""}>3</option>
                </select>
              </div>
            </div>
            <div className="row uniform obsessionComplete">
              <div className="12u">
                <a href="javascript:{}" onClick={this.completeObsession.bind()} className="button special">Complete Obsession</a>
              </div>
            </div>
          </div>
          <ul className="alt">
            {
              this.props.player.skills.map(function (skill, index) {
                if(typeof skill === "undefined" || skill == null || skill == "") return;
                return (
                  <li>
                  {skill}
                  <div className="approveDeny">
                    <span>
                      <i className={"fa fa-check approve " + (this.props.player.lockedSkills[index] ? "true" : "")} onClick={this.setSkillState.bind(this, index, true)}></i>
                      <i className="fa fa-times deny" onClick={this.setSkillState.bind(this, index, false)}></i>
                    </span>
                  </div>
                  </li>
                )
              }, this)
            }
          </ul>
          
        </div>
      </div>
    );
  }
  
}