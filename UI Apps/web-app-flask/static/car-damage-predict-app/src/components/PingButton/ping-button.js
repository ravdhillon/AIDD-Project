import React from 'react';
import {pingService} from '../../services/main-service.js';

class PingButton extends React.Component {
  constructor(props) {
      super(props);
      this.state = {
          pinged: false
      };
      this.pingMe = this.pingMe.bind(this);
  }
  pingMe = () => {
    pingService().then(data => {
      alert(data.ping);
    })
  }
  render() {
      return <button onClick={this.pingMe}>Ping</button>
  }      
}
export default PingButton;