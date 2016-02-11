class Component extends React.Component {
  _bind(...methods) {
    methods.forEach((method) => this[method] = this[method].bind(this));
  }
}

class AudioPlayer extends Component {

  constructor(file) {
    super();
    var formats = ["mp3", "ogg"];
    this.audio = new Audio();
    for(var i = 0; i < formats.length; i++) {
      var source = document.createElement('source');
      switch(formats[i]) {
        case "mp3":
          source.type = "audio/mpeg";
          break;
        default:
          source.type = "audio/" + formats[i];
      }
      source.src = file + "." + formats[i];
      this.audio.appendChild(source);
    }
    this.audio.load();
  }
  
  play() {
    this.audio.play();
  }
  
}