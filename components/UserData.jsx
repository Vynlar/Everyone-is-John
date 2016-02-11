class Component extends React.Component {
  _bind(...methods) {
    methods.forEach((method) => this[method] = this[method].bind(this));
  }
}

class UserData extends Component {
  
  constructor() {
    super();
    this._bind("onChange","onSkillChange","setSkill","setObsession");
  }
  
  onChange(event) {
    var data = {};
    data[event.target.getAttribute('data-id')] = event.target.value;
    this.props.updateState(data);
  }
  
  onSkillChange(event) {
    this.props.updateSkill(event.target.getAttribute('data-skillid'), event.target.value);
  }
  
  setSkill(event) {
    socket.emit('setSkill', {
      skill: event.target.value,
      id: Number(event.target.getAttribute('data-skillid'))
    });
  }
  
  setObsession(event) {
    var obsession = event.target.value;
    socket.emit('setObsession', obsession);
  }
  
  render() {
   return (
      <div id="playerInfo">
        <h2 id="points">You have <span className="bolder">{this.props.player.totalScore}</span> points</h2>
        <div id="obsession">
          <h2>Obsession {
            this.props.player.obsessionWorth > 0 ? "(" + this.props.player.obsessionWorth + " Points)" : ""
          }</h2>
          <input className={!this.props.player.obsessionApproved ? "" : "hidden"} type="text" placeholder="You must have an obsession to play!" data-id="obsession" onBlur={this.setObsession} value={this.props.player.obsession} onChange={this.onChange} />
          <h3 className={this.props.player.obsessionApproved ? "" : "hidden"}>{this.props.player.obsession}</h3>
        </div>
        <div id="skills">
          <h2>Skills</h2>
          <ol>
            {
              this.props.player.skills.map(function(skill, index) {
                return (
                   <li>
                      <input className={!this.props.player.lockedSkills[index] ? "" : "hidden"} type="text" placeholder={"Skill " + (index + 1)} data-skillid={index} onBlur={this.setSkill} value={skill} onChange={this.onSkillChange} />
                      <h3 className={this.props.player.lockedSkills[index] ? "" : "hidden"}>{this.props.player.skills[index]}</h3>
                  </li>
                );
              }, this)
              
            }
           
          </ol>
        </div>
      </div>
    );
  }
  
}